import Settings from "../Schema/Settings.js";
import User from "../Schema/user.js";
import Customer from "../Schema/customer.js";
import CustomerEntry from "../Schema/customerEntry.js";
import Shop from "../Schema/shop.js";
import cron from "node-cron";
import { generateInvoicePDF } from "../Module/pdfGenerator.js";
import FormData from "form-data";
import fetch from "node-fetch";
import process from "process";

/**
 * Get all customers with their entries for invoice generation
 */
const getCustomersWithEntries = async (userId, month, year) => {
  try {
    const customers = await Customer.find({ uid: userId, status: "active" });
    const customerInvoices = [];

    for (const customer of customers) {
      const entries = await CustomerEntry.find({
        cid: customer._id,
      }).sort({ delivery_date: 1 });

      // Filter entries for the specified month and year
      const monthEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.delivery_date);
        return (
          entryDate.getMonth() === month && entryDate.getFullYear() === year
        );
      });

      if (monthEntries.length > 0) {
        customerInvoices.push({
          customerDetails: customer,
          customerEntry: monthEntries,
        });
      }
    }

    return customerInvoices;
  } catch (error) {
    console.error("Error fetching customers with entries:", error);
    return [];
  }
};

/**
 * Upload PDF to WhatsApp and get media ID
 */
const uploadPDFToWhatsApp = async (pdfBuffer, filename) => {
  try {
    const whatsappConfig = {
      version: process.env.VITE_WHATSAPP_API_VERSION || "v20.0",
      phoneNumberId: process.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.VITE_WHATSAPP_USER_ACCESS_TOKEN,
    };

    const formData = new FormData();
    formData.append("file", pdfBuffer, {
      filename: filename,
      contentType: "application/pdf",
    });
    formData.append("messaging_product", "whatsapp");

    const response = await fetch(
      `https://graph.facebook.com/${whatsappConfig.version}/${whatsappConfig.phoneNumberId}/media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappConfig.accessToken}`,
          ...formData.getHeaders(),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to upload PDF");
    }

    const { id: mediaId } = await response.json();
    return mediaId;
  } catch (error) {
    console.error("Error uploading PDF to WhatsApp:", error);
    throw error;
  }
};

/**
 * Send invoice via WhatsApp
 */
const sendWhatsAppInvoice = async (
  customer,
  mediaId,
  filename,
  totalAmount,
  shopName
) => {
  try {
    const whatsappConfig = {
      version: process.env.VITE_WHATSAPP_API_VERSION || "v20.0",
      phoneNumberId: process.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.VITE_WHATSAPP_USER_ACCESS_TOKEN,
    };

    const response = await fetch(
      `https://graph.facebook.com/${whatsappConfig.version}/${whatsappConfig.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${whatsappConfig.accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: `+91${customer.cphone_number}`,
          type: "template",
          template: {
            name: "purchase_receipt_1",
            language: { code: "en_US" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      id: mediaId,
                      filename: filename,
                    },
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  { type: "text", text: String(totalAmount) },
                  { type: "text", text: shopName || "Paaniwale" },
                  { type: "text", text: "Invoice" },
                ],
              },
            ],
          },
        }),
      }
    );

    const messageData = await response.json();

    if (messageData.error) {
      throw new Error(
        messageData.error.message || "Failed to send WhatsApp message"
      );
    }

    return messageData;
  } catch (error) {
    console.error("Error sending WhatsApp invoice:", error);
    throw error;
  }
};

/**
 * Process and send invoices for all customers
 */
export const processAutoInvoices = async (userId) => {
  try {
    console.log(`🔄 Processing auto invoices for user: ${userId}`);

    // Get user, shop and settings
    const user = await User.findById(userId);
    const shop = await Shop.findOne({ uid: userId });
    const settings = await Settings.findOne({ uid: userId });

    if (!user || !settings || !settings.auto_invoice_enabled) {
      console.log("❌ Auto invoice not enabled or user not found");
      return {
        success: false,
        message: "Auto invoice not enabled",
        sent: 0,
        failed: 0,
      };
    }

    // Combine user and shop data
    const userData = {
      shop_name: shop?.shop_name || "Shop Name",
      shop_address: shop?.shop_address || "N/A",
      phone_number: user.phone_number,
      email: user.email,
    };

    // Get previous month
    const currentDate = new Date();
    const previousMonth =
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
    const previousYear =
      currentDate.getMonth() === 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear();

    // Get customers with entries
    const customerInvoices = await getCustomersWithEntries(
      userId,
      previousMonth,
      previousYear
    );

    if (customerInvoices.length === 0) {
      console.log("ℹ️ No customers with entries found for previous month");
      return {
        success: true,
        message: "No customers to invoice",
        sent: 0,
        failed: 0,
      };
    }

    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [],
    };

    // Process each customer invoice
    for (const invoice of customerInvoices) {
      try {
        // Check if phone is verified
        if (!invoice.customerDetails.phone_verification_status) {
          results.failed++;
          results.errors.push({
            customer: invoice.customerDetails.cname,
            error: "Phone not verified",
          });
          continue;
        }

        // Calculate total bottles and amount
        const totalBottles = invoice.customerEntry.reduce(
          (sum, entry) => sum + (entry.bottle_count || 0),
          0
        );
        const bottlePrice = invoice.customerDetails.bottle_price || 0;
        const totalAmount = totalBottles * bottlePrice;

        // Generate PDF
        console.log(
          `📄 Generating PDF for ${invoice.customerDetails.cname}...`
        );
        const pdfBuffer = await generateInvoicePDF(
          userData,
          invoice.customerDetails,
          invoice.customerEntry,
          totalBottles,
          totalAmount,
          shop?.image_url || null
        );

        // Upload PDF to WhatsApp
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const filename = `Invoice-${months[previousMonth]}-${previousYear}.pdf`;

        console.log(
          `📤 Uploading PDF to WhatsApp for ${invoice.customerDetails.cname}...`
        );
        const mediaId = await uploadPDFToWhatsApp(pdfBuffer, filename);

        // Send WhatsApp message
        console.log(
          `📱 Sending WhatsApp invoice to ${invoice.customerDetails.cname}...`
        );
        await sendWhatsAppInvoice(
          invoice.customerDetails,
          mediaId,
          filename,
          totalAmount,
          userData.shop_name
        );

        console.log(
          `✅ Invoice sent to ${invoice.customerDetails.cname} for ₹${totalAmount}`
        );
        results.sent++;
      } catch (error) {
        console.error(
          `❌ Error processing invoice for ${invoice.customerDetails.cname}:`,
          error
        );
        results.failed++;
        results.errors.push({
          customer: invoice.customerDetails.cname,
          error: error.message,
        });
      }
    }

    // Update last run time
    await Settings.findOneAndUpdate(
      { uid: userId },
      { last_auto_invoice_run: new Date() }
    );

    console.log(
      `✅ Auto invoice processing completed: ${results.sent} sent, ${results.failed} failed`
    );

    return results;
  } catch (error) {
    console.error("❌ Error in processAutoInvoices:", error);
    return {
      success: false,
      message: error.message,
      sent: 0,
      failed: 0,
    };
  }
};

/**
 * Manual trigger for auto invoices (API endpoint)
 */
export const triggerAutoInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await processAutoInvoices(userId);

    res.json({
      status: "success",
      data: results,
      message: `Invoices processed: ${results.sent} sent, ${results.failed} failed`,
    });
  } catch (error) {
    console.error("Error triggering auto invoices:", error);
    res.status(500).json({
      status: "error",
      message: "Error processing auto invoices",
      error: error.message,
    });
  }
};

/**
 * Check and run scheduled invoices for all users
 */
const checkScheduledInvoices = async () => {
  try {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    console.log("📊 Auto Invoice Check Status:");
    console.log(
      "  Current Date:",
      currentDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );
    console.log("  Current Day:", currentDay);
    console.log("  Current Hour:", currentHour);
    console.log("  Current Minute:", currentMinute);

    // Get the last day of current month
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    console.log("  Last Day of Month:", lastDayOfMonth);

    // Find all settings with auto_invoice_enabled
    const allSettings = await Settings.find({ auto_invoice_enabled: true });

    console.log(
      `📋 Found ${allSettings.length} user(s) with auto invoice enabled`
    );

    if (allSettings.length === 0) {
      console.log("ℹ️ No users have auto invoice enabled");
      return;
    }

    for (const setting of allSettings) {
      console.log(`\n👤 Checking User ID: ${setting.uid}`);
      console.log(`  Scheduled Day: ${setting.auto_invoice_day}`);
      console.log(`  Scheduled Time: ${setting.auto_invoice_time}`);
      console.log(`  Last Run: ${setting.last_auto_invoice_run || "Never"}`);

      let scheduledDay = setting.auto_invoice_day;

      // Smart date adjustment: If scheduled day exceeds month's days, use last day
      if (scheduledDay > lastDayOfMonth) {
        scheduledDay = lastDayOfMonth;
        console.log(
          `  📅 Smart adjustment: Day ${setting.auto_invoice_day} → ${scheduledDay} (last day of month)`
        );
      }

      // Check if today matches the scheduled day (or adjusted day)
      if (scheduledDay !== currentDay) {
        console.log(
          `  ⏭️ Skipping: Today (${currentDay}) doesn't match scheduled day (${scheduledDay})`
        );
        continue;
      }

      console.log(`  ✅ Day matches! Checking time...`);

      // Parse scheduled time
      const [scheduledHour, scheduledMinute] = setting.auto_invoice_time
        .split(":")
        .map(Number);
      console.log(
        `  Scheduled Hour: ${scheduledHour}, Scheduled Minute: ${
          scheduledMinute || 0
        }`
      );

      // Check if current time matches scheduled time (within 1 hour window)
      if (currentHour === scheduledHour && currentMinute < 60) {
        console.log(`  ✅ Time matches! Checking if already ran today...`);

        // Check if already ran today
        const lastRun = setting.last_auto_invoice_run;
        if (lastRun) {
          const lastRunDate = new Date(lastRun);
          if (
            lastRunDate.getDate() === currentDay &&
            lastRunDate.getMonth() === currentDate.getMonth() &&
            lastRunDate.getFullYear() === currentDate.getFullYear()
          ) {
            console.log(
              `  ⏭️ Skipping: Already ran today at ${lastRunDate.toLocaleString(
                "en-IN",
                { timeZone: "Asia/Kolkata" }
              )}`
            );
            continue;
          }
        }

        console.log(`  🚀 EXECUTING auto invoice for user ${setting.uid}`);
        await processAutoInvoices(setting.uid);
      } else {
        console.log(
          `  ⏭️ Skipping: Current hour (${currentHour}) doesn't match scheduled hour (${scheduledHour})`
        );
      }
    }

    console.log("\n✅ Auto invoice check completed\n");
  } catch (error) {
    console.error("❌ Error in checkScheduledInvoices:", error);
  }
};

/**
 * Initialize auto invoice scheduler
 * Runs every hour to check if invoices should be sent
 */
export const initAutoInvoiceScheduler = () => {
  console.log("🚀 Auto Invoice Scheduler Initialized");
  console.log("⏰ Schedule: Every hour at minute 0 (0 * * * *)");
  console.log(
    "📅 Current time:",
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  );

  // Run every hour
  const task = cron.schedule("0 * * * *", () => {
    const now = new Date();
    console.log(
      `⏰ [${now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}] Running auto invoice scheduler check...`
    );
    checkScheduledInvoices();
  });

  if (task) {
    console.log("✅ Cron job scheduled successfully");
  } else {
    console.error("❌ Failed to schedule cron job");
  }

  // Run once immediately to test
  console.log("🔄 Running initial check...");
  checkScheduledInvoices();
};

/**
 * Get next scheduled invoice date
 */
export const getNextInvoiceDate = async (req, res) => {
  try {
    const settings = await Settings.findOne({ uid: req.user.id });

    if (!settings || !settings.auto_invoice_enabled) {
      return res.json({
        status: "success",
        data: null,
        message: "Auto invoice not enabled",
      });
    }

    const currentDate = new Date();
    let scheduledDay = settings.auto_invoice_day;
    const [scheduledHour, scheduledMinute] = settings.auto_invoice_time
      .split(":")
      .map(Number);

    // Calculate next run date for current month
    let nextDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      Math.min(
        scheduledDay,
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate()
      ),
      scheduledHour,
      scheduledMinute
    );

    // If the scheduled date has passed this month, move to next month
    if (nextDate < currentDate) {
      const nextMonth = currentDate.getMonth() + 1;
      const nextYear =
        nextMonth > 11
          ? currentDate.getFullYear() + 1
          : currentDate.getFullYear();
      const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;

      // Get last day of next month
      const lastDayOfNextMonth = new Date(
        nextYear,
        adjustedMonth + 1,
        0
      ).getDate();

      nextDate = new Date(
        nextYear,
        adjustedMonth,
        Math.min(scheduledDay, lastDayOfNextMonth),
        scheduledHour,
        scheduledMinute
      );
    }

    res.json({
      status: "success",
      data: {
        nextDate: nextDate,
        lastRun: settings.last_auto_invoice_run,
        enabled: settings.auto_invoice_enabled,
        scheduledDay: settings.auto_invoice_day,
      },
    });
  } catch (error) {
    console.error("Error getting next invoice date:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting next invoice date",
      error: error.message,
    });
  }
};
