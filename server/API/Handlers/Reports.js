import Customer from "../Schema/customer.js";
import CustomerEntry from "../Schema/customerEntry.js";
import PaymentDetail from "../Schema/PaymentDetail.js";
import User from "../Schema/user.js";
import Inquiry from "../Schema/inquiry.js";
import nodemailer from "nodemailer";
import process from "process";

// Create email transporter (same as Inquiry.js)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "paaniwale7@gmail.com",
      pass: process.env.EMAIL_PASS || "", // Use app password for Gmail
    },
  });
};

/**
 * Generate Customer Report
 * @route POST /api/reports/customers
 * @access Protected (Admin only)
 */
export const generateCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.body;

    // Build query
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    // Fetch customers
    const customers = await Customer.find(query)
      .populate("uid", "fname lname email phone_number")
      .sort({ createdAt: -1 })
      .lean();

    // Get customer entries count for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const entries = await CustomerEntry.find({ cid: customer._id });
        const totalBottles = entries.reduce(
          (sum, entry) => sum + (entry.bottle_count || 0),
          0
        );
        const totalRevenue = entries.reduce(
          (sum, entry) => sum + (entry.amount || 0),
          0
        );

        return {
          ...customer,
          totalEntries: entries.length,
          totalBottles,
          totalRevenue,
        };
      })
    );

    // Calculate summary
    const summary = {
      totalCustomers: customersWithStats.length,
      activeCustomers: customersWithStats.filter((c) => c.status === "active")
        .length,
      inactiveCustomers: customersWithStats.filter(
        (c) => c.status === "inactive"
      ).length,
      totalRevenue: customersWithStats.reduce(
        (sum, c) => sum + c.totalRevenue,
        0
      ),
      totalBottles: customersWithStats.reduce(
        (sum, c) => sum + c.totalBottles,
        0
      ),
      averageRevenuePerCustomer:
        customersWithStats.length > 0
          ? customersWithStats.reduce((sum, c) => sum + c.totalRevenue, 0) /
            customersWithStats.length
          : 0,
    };

    res.status(200).json({
      success: true,
      message: "Customer report generated successfully",
      data: {
        summary,
        customers: customersWithStats,
        generatedAt: new Date(),
        filters: { startDate, endDate, status },
      },
    });
  } catch (error) {
    console.error("Generate Customer Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate customer report",
      error: error.message,
    });
  }
};

/**
 * Generate Revenue Report
 * @route POST /api/reports/revenue
 * @access Protected (Admin only)
 */
export const generateRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "month" } = req.body;

    // Build query
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch entries
    const entries = await CustomerEntry.find(query)
      .populate("cid", "cname cphone_number")
      .populate("uid", "fname lname")
      .sort({ createdAt: -1 })
      .lean();

    // Group by time period
    const groupedData = {};
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      let key;

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0];
      } else if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      } else if (groupBy === "year") {
        key = String(date.getFullYear());
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          totalRevenue: 0,
          totalBottles: 0,
          totalOrders: 0,
          entries: [],
        };
      }

      groupedData[key].totalRevenue += entry.amount || 0;
      groupedData[key].totalBottles += entry.bottle_count || 0;
      groupedData[key].totalOrders += 1;
      groupedData[key].entries.push(entry);
    });

    // Convert to array and sort
    const revenueData = Object.values(groupedData).sort((a, b) =>
      a.period.localeCompare(b.period)
    );

    // Calculate summary
    const summary = {
      totalRevenue: entries.reduce((sum, e) => sum + (e.amount || 0), 0),
      totalBottles: entries.reduce((sum, e) => sum + (e.bottle_count || 0), 0),
      totalOrders: entries.length,
      averageOrderValue:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + (e.amount || 0), 0) /
            entries.length
          : 0,
      averageBottlesPerOrder:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + (e.bottle_count || 0), 0) /
            entries.length
          : 0,
    };

    res.status(200).json({
      success: true,
      message: "Revenue report generated successfully",
      data: {
        summary,
        revenueData,
        generatedAt: new Date(),
        filters: { startDate, endDate, groupBy },
      },
    });
  } catch (error) {
    console.error("Generate Revenue Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate revenue report",
      error: error.message,
    });
  }
};

/**
 * Generate Payment Report
 * @route POST /api/reports/payments
 * @access Protected (Admin only)
 */
export const generatePaymentReport = async (req, res) => {
  try {
    const { startDate, endDate, payment_status, payment_method } = req.body;

    // Build query
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (payment_status) {
      query.payment_status = payment_status;
    }

    if (payment_method) {
      query.payment_method = payment_method;
    }

    // Fetch payments
    const payments = await PaymentDetail.find(query)
      .populate("cid", "cname cphone_number")
      .populate("uid", "fname lname email phone_number")
      .populate("approved_by", "fname lname")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary
    const summary = {
      totalPayments: payments.length,
      pendingPayments: payments.filter((p) => p.payment_status === "pending")
        .length,
      approvedPayments: payments.filter((p) => p.payment_status === "approved")
        .length,
      rejectedPayments: payments.filter((p) => p.payment_status === "rejected")
        .length,
      completedPayments: payments.filter(
        (p) => p.payment_status === "completed"
      ).length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      approvedAmount: payments
        .filter(
          (p) =>
            p.payment_status === "approved" || p.payment_status === "completed"
        )
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingAmount: payments
        .filter((p) => p.payment_status === "pending")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      rejectedAmount: payments
        .filter((p) => p.payment_status === "rejected")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    // Group by payment method
    const methodBreakdown = {};
    payments.forEach((payment) => {
      const method = payment.payment_method || "unknown";
      if (!methodBreakdown[method]) {
        methodBreakdown[method] = {
          count: 0,
          amount: 0,
        };
      }
      methodBreakdown[method].count += 1;
      methodBreakdown[method].amount += payment.amount || 0;
    });

    res.status(200).json({
      success: true,
      message: "Payment report generated successfully",
      data: {
        summary,
        methodBreakdown,
        payments,
        generatedAt: new Date(),
        filters: { startDate, endDate, payment_status, payment_method },
      },
    });
  } catch (error) {
    console.error("Generate Payment Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate payment report",
      error: error.message,
    });
  }
};

/**
 * Generate Inventory Report (Bottle tracking)
 * @route POST /api/reports/inventory
 * @access Protected (Admin only)
 */
export const generateInventoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Build query
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch all customer entries
    const entries = await CustomerEntry.find(query)
      .populate("cid", "cname cphone_number bottle_price")
      .populate("uid", "fname lname")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate inventory stats
    const totalBottlesDelivered = entries.reduce(
      (sum, e) => sum + (e.bottle_count || 0),
      0
    );

    // Group by customer
    const customerInventory = {};
    entries.forEach((entry) => {
      const customerId = entry.cid?._id?.toString() || "unknown";
      if (!customerInventory[customerId]) {
        customerInventory[customerId] = {
          customer: entry.cid,
          totalBottles: 0,
          totalRevenue: 0,
          deliveryCount: 0,
          entries: [],
        };
      }
      customerInventory[customerId].totalBottles += entry.bottle_count || 0;
      customerInventory[customerId].totalRevenue += entry.amount || 0;
      customerInventory[customerId].deliveryCount += 1;
      customerInventory[customerId].entries.push(entry);
    });

    // Convert to array
    const inventoryByCustomer = Object.values(customerInventory).sort(
      (a, b) => b.totalBottles - a.totalBottles
    );

    // Calculate summary
    const summary = {
      totalBottlesDelivered,
      totalDeliveries: entries.length,
      totalRevenue: entries.reduce((sum, e) => sum + (e.amount || 0), 0),
      averageBottlesPerDelivery:
        entries.length > 0 ? totalBottlesDelivered / entries.length : 0,
      topCustomers: inventoryByCustomer.slice(0, 10).map((c) => ({
        name: c.customer?.cname || "Unknown",
        bottles: c.totalBottles,
        revenue: c.totalRevenue,
      })),
    };

    res.status(200).json({
      success: true,
      message: "Inventory report generated successfully",
      data: {
        summary,
        inventoryByCustomer,
        generatedAt: new Date(),
        filters: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error("Generate Inventory Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
      error: error.message,
    });
  }
};

/**
 * Generate User Report
 * @route POST /api/reports/users
 * @access Protected (Admin only)
 */
export const generateUserReport = async (req, res) => {
  try {
    const { startDate, endDate, status, is_admin } = req.body;

    // Build query
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    if (is_admin !== undefined) {
      query.is_admin = is_admin;
    }

    // Fetch users (exclude password)
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Get activity stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const customerEntries = await CustomerEntry.countDocuments({
          uid: user._id,
        });
        const customers = await Customer.countDocuments({ uid: user._id });
        const payments = await PaymentDetail.countDocuments({ uid: user._id });

        return {
          ...user,
          stats: {
            totalCustomers: customers,
            totalDeliveries: customerEntries,
            totalPayments: payments,
          },
        };
      })
    );

    // Calculate summary
    const summary = {
      totalUsers: usersWithStats.length,
      activeUsers: usersWithStats.filter((u) => u.status === "active").length,
      inactiveUsers: usersWithStats.filter((u) => u.status === "inactive")
        .length,
      suspendedUsers: usersWithStats.filter((u) => u.status === "suspended")
        .length,
      adminUsers: usersWithStats.filter((u) => u.is_admin).length,
      regularUsers: usersWithStats.filter((u) => !u.is_admin).length,
    };

    res.status(200).json({
      success: true,
      message: "User report generated successfully",
      data: {
        summary,
        users: usersWithStats,
        generatedAt: new Date(),
        filters: { startDate, endDate, status, is_admin },
      },
    });
  } catch (error) {
    console.error("Generate User Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate user report",
      error: error.message,
    });
  }
};

/**
 * Generate Comprehensive Report (All data)
 * @route POST /api/reports/comprehensive
 * @access Protected (Admin only)
 */
export const generateComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Build query
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    // Fetch all data in parallel
    const [customers, entries, payments, users, inquiries] = await Promise.all([
      Customer.find(dateQuery).countDocuments(),
      CustomerEntry.find(dateQuery).lean(),
      PaymentDetail.find(dateQuery).lean(),
      User.find(dateQuery).countDocuments(),
      Inquiry.find(dateQuery).countDocuments(),
    ]);

    // Calculate comprehensive stats
    const totalRevenue = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalBottles = entries.reduce(
      (sum, e) => sum + (e.bottle_count || 0),
      0
    );
    const totalPaymentAmount = payments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const report = {
      overview: {
        totalCustomers: customers,
        totalUsers: users,
        totalDeliveries: entries.length,
        totalBottles,
        totalRevenue,
        totalPayments: payments.length,
        totalPaymentAmount,
        totalInquiries: inquiries,
      },
      customers: {
        total: customers,
        averageRevenuePerCustomer: customers > 0 ? totalRevenue / customers : 0,
      },
      deliveries: {
        total: entries.length,
        totalBottles,
        totalRevenue,
        averageBottlesPerDelivery:
          entries.length > 0 ? totalBottles / entries.length : 0,
        averageOrderValue:
          entries.length > 0 ? totalRevenue / entries.length : 0,
      },
      payments: {
        total: payments.length,
        totalAmount: totalPaymentAmount,
        pending: payments.filter((p) => p.payment_status === "pending").length,
        approved: payments.filter((p) => p.payment_status === "approved")
          .length,
        rejected: payments.filter((p) => p.payment_status === "rejected")
          .length,
        completed: payments.filter((p) => p.payment_status === "completed")
          .length,
        pendingAmount: payments
          .filter((p) => p.payment_status === "pending")
          .reduce((sum, p) => sum + (p.amount || 0), 0),
        approvedAmount: payments
          .filter(
            (p) =>
              p.payment_status === "approved" ||
              p.payment_status === "completed"
          )
          .reduce((sum, p) => sum + (p.amount || 0), 0),
      },
      users: {
        total: users,
      },
      inquiries: {
        total: inquiries,
      },
      generatedAt: new Date(),
      filters: { startDate, endDate },
    };

    res.status(200).json({
      success: true,
      message: "Comprehensive report generated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Generate Comprehensive Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate comprehensive report",
      error: error.message,
    });
  }
};

/**
 * Email Report to User
 * @route POST /api/reports/email
 * @access Protected (Admin only)
 */
export const emailReport = async (req, res) => {
  try {
    const { reportType, reportName, startDate, endDate, format } = req.body;
    const user = await User.findById(req.user.id).select(
      "email fname lname phone_number"
    );

    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message:
          "User email not found. Please update your profile with an email address.",
      });
    }

    // Generate the report data based on type
    let reportData;

    // Build query for date range
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch report data based on type
    switch (reportType) {
      case "customers": {
        const customers = await Customer.find(query)
          .populate("uid", "fname lname")
          .limit(100)
          .lean();
        reportData = {
          totalCustomers: customers.length,
          customers: customers.slice(0, 10), // Top 10 for email
        };
        break;
      }
      case "payments": {
        const payments = await PaymentDetail.find(query)
          .populate("cid", "cname cphone_number")
          .limit(100)
          .lean();
        const totalAmount = payments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        );
        reportData = {
          totalPayments: payments.length,
          totalAmount,
          recentPayments: payments.slice(0, 10),
        };
        break;
      }
      case "revenue": {
        const entries = await CustomerEntry.find(query).lean();
        const totalRevenue = entries.reduce(
          (sum, e) => sum + (e.amount || 0),
          0
        );
        const totalBottles = entries.reduce(
          (sum, e) => sum + (e.bottle_count || 0),
          0
        );
        reportData = {
          totalRevenue,
          totalBottles,
          totalOrders: entries.length,
          averageOrderValue:
            entries.length > 0 ? totalRevenue / entries.length : 0,
        };
        break;
      }
      default:
        reportData = { message: "Report data will be attached" };
    }

    // Format dates for display
    const formatDate = (date) => {
      return date
        ? new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "Asia/Kolkata",
          })
        : "Not specified";
    };

    // Create report summary HTML
    const reportSummaryHTML = () => {
      if (reportType === "customers") {
        return `
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Report Summary</h3>
            <p><strong>Total Customers:</strong> ${
              reportData.totalCustomers
            }</p>
            <p><strong>Date Range:</strong> ${formatDate(
              startDate
            )} to ${formatDate(endDate)}</p>
            
            ${
              reportData.customers.length > 0
                ? `
              <h4 style="color: #4b5563; margin-top: 20px;">Top 10 Customers:</h4>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #e5e7eb;">
                    <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Name</th>
                    <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Phone</th>
                    <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.customers
                    .map(
                      (c) => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d1d5db;">${
                        c.cname || "N/A"
                      }</td>
                      <td style="padding: 8px; border: 1px solid #d1d5db;">${
                        c.cphone_number || "N/A"
                      }</td>
                      <td style="padding: 8px; border: 1px solid #d1d5db;">
                        <span style="background: ${
                          c.status === "active" ? "#dcfce7" : "#fee2e2"
                        }; 
                                     color: ${
                                       c.status === "active"
                                         ? "#166534"
                                         : "#991b1b"
                                     }; 
                                     padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                          ${c.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : ""
            }
          </div>
        `;
      } else if (reportType === "payments") {
        return `
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Report Summary</h3>
            <p><strong>Total Payments:</strong> ${reportData.totalPayments}</p>
            <p><strong>Total Amount:</strong> ₹${reportData.totalAmount.toLocaleString(
              "en-IN"
            )}</p>
            <p><strong>Date Range:</strong> ${formatDate(
              startDate
            )} to ${formatDate(endDate)}</p>
            
            ${
              reportData.recentPayments.length > 0
                ? `
              <h4 style="color: #4b5563; margin-top: 20px;">Recent Payments:</h4>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #e5e7eb;">
                    <th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Customer</th>
                    <th style="padding: 8px; text-align: right; border: 1px solid #d1d5db;">Amount</th>
                    <th style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.recentPayments
                    .map(
                      (p) => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d1d5db;">${
                        p.cid?.cname || "N/A"
                      }</td>
                      <td style="padding: 8px; text-align: right; border: 1px solid #d1d5db;">₹${(
                        p.amount || 0
                      ).toLocaleString("en-IN")}</td>
                      <td style="padding: 8px; text-align: center; border: 1px solid #d1d5db;">
                        <span style="background: ${
                          p.payment_status === "approved"
                            ? "#dcfce7"
                            : "#fef3c7"
                        }; 
                                     color: ${
                                       p.payment_status === "approved"
                                         ? "#166534"
                                         : "#92400e"
                                     }; 
                                     padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                          ${p.payment_status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : ""
            }
          </div>
        `;
      } else if (reportType === "revenue") {
        return `
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Report Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Revenue</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #16a34a;">₹${reportData.totalRevenue.toLocaleString(
                  "en-IN"
                )}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #7c3aed;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Orders</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1f2937;">${
                  reportData.totalOrders
                }</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Bottles</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1f2937;">${
                  reportData.totalBottles
                }</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Avg Order Value</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1f2937;">₹${reportData.averageOrderValue.toFixed(
                  2
                )}</p>
              </div>
            </div>
            <p style="margin-top: 15px;"><strong>Date Range:</strong> ${formatDate(
              startDate
            )} to ${formatDate(endDate)}</p>
          </div>
        `;
      } else {
        return `
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Report Summary</h3>
            <p><strong>Report Type:</strong> ${reportName}</p>
            <p><strong>Format:</strong> ${format.toUpperCase()}</p>
            <p><strong>Date Range:</strong> ${formatDate(
              startDate
            )} to ${formatDate(endDate)}</p>
          </div>
        `;
      }
    };

    // Send email using nodemailer
    try {
      const transporter = createTransporter();

      const emailContent = {
        from: process.env.EMAIL_USER || "paaniwale7@gmail.com",
        to: ["dhruvprajapati66572@gmail.com", "het.solanki090@gmail.com"],
        subject: `${reportName} - Paani Wale Report`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">📊 Paani Wale</h1>
              <p style="margin: 10px 0 0 0;">Business Analytics Report</p>
            </div>
            
            <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin-top: 0;">Hello ${user.fname} ${
          user.lname
        },</h2>
              
              <p style="color: #4b5563;">Your <strong>${reportName}</strong> has been generated successfully.</p>
              
              ${reportSummaryHTML()}
              
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>📥 Download:</strong> The full ${format.toUpperCase()} report is available for download from your dashboard.
                </p>
              </div>
              
              <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <h3 style="color: #374151; margin-top: 0;">Need Help?</h3>
                <ul style="color: #4b5563; margin: 10px 0;">
                  <li>📞 Call us: <a href="tel:+916355459412" style="color: #2563eb; text-decoration: none;">+91 6355459412</a></li>
                  <li>📧 Email: <a href="mailto:paaniwale7@gmail.com" style="color: #2563eb; text-decoration: none;">paaniwale7@gmail.com</a></li>
                  <li>🌐 Visit Dashboard for more insights</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Generated on: ${new Date().toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Best regards,<br>
                <strong style="color: #1f2937;">Paani Wale Team</strong><br>
                Smart Water Supply Management
              </p>
            </div>
            
            <div style="text-align: center; padding: 15px; background: #f9fafb; border-radius: 8px; margin-top: 10px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} Paani Wale. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(emailContent);

      // Log success
      console.log(`✅ Report email sent successfully to ${user.email}`);

      res.status(200).json({
        success: true,
        message: `Report sent successfully to ${user.email}`,
        data: {
          recipientEmail: user.email,
          recipientName: `${user.fname} ${user.lname}`,
          reportName,
          reportType,
          format,
          sentAt: new Date(),
        },
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);

      // Return error but don't fail completely
      res.status(500).json({
        success: false,
        message: "Failed to send email. Please check email configuration.",
        error: emailError.message,
        note: "Make sure EMAIL_PASS is set in environment variables (Gmail app password required)",
      });
    }
  } catch (error) {
    console.error("Email Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send report email",
      error: error.message,
    });
  }
};

/**
 * Schedule Report
 * @route POST /api/reports/schedule
 * @access Protected (Admin only)
 */
export const scheduleReport = async (req, res) => {
  try {
    const {
      reportType,
      reportName,
      dateRange,
      format,
      frequency = "weekly",
    } = req.body;
    const userId = req.user.id;

    // Here you would:
    // 1. Store the schedule in a database (create a ReportSchedule schema)
    // 2. Set up a cron job or use a job scheduler like Bull/BullMQ
    // 3. Generate and send the report at the scheduled time

    // Example schedule data structure:
    const scheduleData = {
      userId,
      reportType,
      reportName,
      dateRange,
      format,
      frequency, // daily, weekly, monthly
      isActive: true,
      nextRun: calculateNextRun(frequency),
      createdAt: new Date(),
    };

    // Log the schedule request (for development)
    console.log(`Schedule report request:`, scheduleData);

    res.status(200).json({
      success: true,
      message: `${reportName} scheduled successfully. Will be generated ${frequency}. Scheduler integration pending.`,
      data: {
        schedule: scheduleData,
        note: "To implement: Create ReportSchedule schema and integrate with node-cron or BullMQ",
      },
    });
  } catch (error) {
    console.error("Schedule Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule report",
      error: error.message,
    });
  }
};

// Helper function to calculate next run time
function calculateNextRun(frequency) {
  const now = new Date();
  const nextRun = new Date(now);

  switch (frequency) {
    case "daily":
      nextRun.setDate(now.getDate() + 1);
      break;
    case "weekly":
      nextRun.setDate(now.getDate() + 7);
      break;
    case "monthly":
      nextRun.setMonth(now.getMonth() + 1);
      break;
    default:
      nextRun.setDate(now.getDate() + 7); // Default to weekly
  }

  nextRun.setHours(9, 0, 0, 0); // Set to 9 AM
  return nextRun;
}
