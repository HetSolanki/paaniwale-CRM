/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { useUser } from "@/Context/UserContext";
import { GetAllCustomerInvoice } from "@/Handlers/GetAllCustomerInvoice";
// import { createPaymentLink } from "@/Handlers/CreatepaymentLinkHandler"; // DISABLED - No Razorpay
import { Button } from "../UI/shadcn-UI/button";
import { Loader2, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "../UI/shadcn-UI/use-toast";
import { config } from "@/Data/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../UI/shadcn-UI/dialog";
import { ScrollArea } from "../UI/shadcn-UI/scroll-area";

export const InvoiceAll = () => {
  const user = useUser();
  const [customerInvoice, setCustomerInvoice] = useState(null);
  const [click, setClick] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [sendingStatus, setSendingStatus] = useState([]);

  const { toast } = useToast();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const fetchCustomerData = async () => {
      const customerData = await GetAllCustomerInvoice();
      if (customerData?.data) {
        setCustomerInvoice(customerData.data);
      }
    };
    fetchCustomerData();
  }, []);

  const handleClick = async () => {
    const confirmation = confirm(
      "Are you sure you want to send invoice to all customers?"
    );

    if (!confirmation) {
      return;
    }

    // Check if there are customers with entries for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const customersWithoutEntries = [];

    customerInvoice.forEach((customer) => {
      const hasCurrentMonthEntry = customer.customerEntry.some((entry) => {
        const entryDate = new Date(entry.delivery_date);
        return (
          entryDate.getMonth() === currentMonth &&
          entryDate.getFullYear() === currentYear
        );
      });

      if (!hasCurrentMonthEntry) {
        customersWithoutEntries.push(
          customer.customerDetails?.cname || "Unknown"
        );
      }
    });

    if (customersWithoutEntries.length > 0) {
      toast({
        variant: "destructive",
        title: "No Entries Found",
        description: `${customersWithoutEntries.length} customer(s) have no entries for ${months[currentMonth]} ${currentYear}. Please add entries before sending invoices.`,
      });
      return;
    }

    setClick(true);
    setShowStatusDialog(true);

    // Initialize status for all customers
    const initialStatus = customerInvoice.map((customer) => ({
      name: customer.customerDetails?.cname || "Unknown",
      phone: customer.customerDetails?.cphone_number || "N/A",
      status: "pending", // pending, processing, success, failed
      message: "Waiting...",
      // paymentLink: null, // DISABLED - No Razorpay
      phone_verification_status:
        customer.customerDetails?.phone_verification_status || false,
    }));
    setSendingStatus(initialStatus);

    // Process each customer sequentially
    for (let index = 0; index < customerInvoice.length; index++) {
      const customer = customerInvoice[index];

      // Update status to processing

      try {
        if (!customer.customerDetails?.phone_verification_status)
          throw new Error("Phone number is not verified");

        setSendingStatus((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, status: "processing", message: "Generating PDF..." }
              : item
          )
        );
        const partitionSize = Math.ceil(customer.customerEntry.length / 3);

        const firstPartCustomers = customer.customerEntry.slice(
          0,
          partitionSize
        );
        const secondPartCustomers = customer.customerEntry.slice(
          partitionSize,
          partitionSize * 2
        );
        const thirdPartCustomers = customer.customerEntry.slice(
          partitionSize * 2
        );
        const pdf = new jsPDF();

        // Shop details
        pdf.setFontSize(24);
        pdf.setFont("Helvetica-Bold", "bold");
        pdf.text(`${user?.user?.shop_name}`, 15, 15);
        pdf.setFontSize(16);
        pdf.setFont("Helvetica-Bold", "bold");
        pdf.text("Address:", 15, 25);
        pdf.setFont("Helvetica", "normal");
        pdf.text(`${user?.user?.shop_address}`, 38, 25);

        const logo = new Image();
        logo.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;
        pdf.addImage(logo, "png", 180, 10, 20, 20);

        // Invoice details
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Invoice #", 145, 45);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text("INV-20240616-0134", 145, 52);

        // Customer details
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Bill to:", 15, 45);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${customer?.customerDetails?.cname}`, 15, 52);
        pdf.text(`${customer?.customerDetails?.caddress}`, 15, 59);
        pdf.text(`${customer?.customerDetails?.cphone_number}`, 15, 66);

        const date = new Date();

        // Invoice dates
        pdf.setFontSize(12);
        pdf.text(
          `Invoice date: ${date.getDate()}-${
            months[date.getMonth()]
          }-${date.getFullYear()}`,
          145,
          59
        );
        date.setDate(date.getDate() + 7);
        pdf.text(
          `Due date: ${date.getDate()}-${
            months[date.getMonth()]
          }-${date.getFullYear()}`,
          145,
          66
        );

        // Table headers
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("DATE", 15, 80);
        pdf.text("QTY", 45, 80);
        pdf.text("DATE", 85, 80);
        pdf.text("QTY", 115, 80);
        pdf.text("DATE", 145, 80);
        pdf.text("QTY", 175, 80);

        // Table content
        pdf.setFont("helvetica", "normal");
        let yOffset = 90;
        const maxRows = Math.max(
          firstPartCustomers?.length,
          secondPartCustomers?.length,
          thirdPartCustomers?.length
        );

        for (let i = 0; i < maxRows; i++) {
          if (firstPartCustomers[i]) {
            pdf.text(firstPartCustomers[i]?.delivery_date, 15, yOffset);
            pdf.text(
              firstPartCustomers[i]?.bottle_count.toString(),
              45,
              yOffset
            );
          }
          if (secondPartCustomers[i]) {
            pdf.text(secondPartCustomers[i]?.delivery_date, 85, yOffset);
            pdf.text(
              secondPartCustomers[i]?.bottle_count.toString(),
              115,
              yOffset
            );
          }
          if (thirdPartCustomers[i]) {
            pdf.text(thirdPartCustomers[i]?.delivery_date, 145, yOffset);
            pdf.text(
              thirdPartCustomers[i]?.bottle_count.toString(),
              175,
              yOffset
            );
          }
          yOffset += 7;
        }

        // Total section
        yOffset += 7;
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Bottle Price:", 15, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${customer?.customerDetails?.bottle_price}`, 95, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "bold");
        pdf.text("Total Delivered Bottle:", 15, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${customer?.totalBottle}`, 95, yOffset);
        yOffset += 10;

        const total_amount =
          customer?.totalBottle * customer?.customerDetails?.bottle_price;

        pdf.setFont("helvetica", "bold");
        pdf.text("Subtotal:", 15, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${total_amount}`, 95, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "bold");
        pdf.text("Total:", 15, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${total_amount}`, 95, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "bold");
        pdf.text("Amount paid:", 15, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Rs. ${total_amount}`, 95, yOffset);
        yOffset += 10;

        pdf.setFont("helvetica", "bold");
        pdf.text("Due balance:", 15, yOffset);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Rs. ${total_amount}`, 95, yOffset);

        // Footer
        yOffset += 10;
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Thank you!", 15, yOffset);
        yOffset += 7;

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0, 0.5);
        pdf.text(
          "If you have any questions concerning this invoice, use the following contact information:",
          15,
          yOffset
        );

        const img = new Image();
        img.src = user?.user?.image_url;
        pdf.addImage(img, "png", 130, yOffset + 5, 50, 50);

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        yOffset += 10;
        pdf.text(`${user?.user?.uid?.phone_number}`, 15, yOffset);
        yOffset += 7;
        pdf.text(`${user?.user?.uid?.email}`, 15, yOffset);
        yOffset += 15;

        pdf.setTextColor(0, 0, 0, 0.5);
        pdf.setFont("helvetica", "italic");
        pdf.text("https://paaniwale.dhruvprajapati.tech/", 15, yOffset);

        const pdfBlob = pdf.output("blob");

        // Update status to uploading
        setSendingStatus((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, message: "Uploading PDF..." } : item
          )
        );

        // Convert blob to base64
        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result.split(",")[1]);
          };
          reader.readAsDataURL(pdfBlob);
        });

        // Upload PDF to Cloudinary
        const formData = new FormData();
        formData.append("file", `data:application/pdf;base64,${base64data}`);
        formData.append("upload_preset", config.cloud.uploadPreset);
        formData.append("folder", "Paaniwale-Invoices");

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${config.cloud.name}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload PDF to Cloudinary");
        }

        const uploadData = await uploadResponse.json();

        // DISABLED: Update status to creating payment link
        // setSendingStatus((prev) =>
        //   prev.map((item, i) =>
        //     i === index
        //       ? { ...item, message: "Creating payment link..." }
        //       : item
        //   )
        // );

        // DISABLED: Create payment link
        // let paymentLinkUrl = "";
        // try {
        //   const paymentLinkData = await createPaymentLink({
        //     amount: total_amount,
        //     description: `Invoice for ${
        //       months[new Date().getMonth()]
        //     } ${new Date().getFullYear()}`,
        //     customer_email: customer?.customerDetails?.cemail || "",
        //     customer_name: customer?.customerDetails?.cname || "",
        //     customer_phone: customer?.customerDetails?.cphone_number || "",
        //     smsnotify: true,
        //     emailnotify: false,
        //     reminder_enable: true,
        //     account_number: user?.user?.account_number || "",
        //   });

        //   if (paymentLinkData?.data?.short_url) {
        //     paymentLinkUrl = paymentLinkData.data.short_url;

        //     // Update status with payment link
        //     setSendingStatus((prev) =>
        //       prev.map((item, i) =>
        //         i === index
        //           ? {
        //               ...item,
        //               paymentLink: paymentLinkUrl,
        //               message: "Payment link created, sending WhatsApp...",
        //             }
        //           : item
        //       )
        //     );
        //   }
        // } catch (paymentError) {
        //   console.error("Payment link creation failed:", paymentError);

        //   // Update status to show payment link failed but continuing
        //   setSendingStatus((prev) =>
        //     prev.map((item, i) =>
        //       i === index
        //         ? {
        //             ...item,
        //             message: "Payment link failed, sending invoice only...",
        //           }
        //         : item
        //     )
        //   );
        // }

        // Update status to sending
        setSendingStatus((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, message: "Sending WhatsApp message..." }
              : item
          )
        );

        // Send WhatsApp message
        const whatsappDate = new Date();

        // Send template message with invoice
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: config.whatsapp.authorization,
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: `91${customer?.customerDetails?.cphone_number}`,
              type: "template",
              template: {
                name: "purchase_receipt_1",
                language: {
                  code: "en_US",
                },
                components: [
                  {
                    type: "header",
                    parameters: [
                      {
                        type: "document",
                        document: {
                          link: uploadData.secure_url,
                          filename: `${
                            months[whatsappDate.getMonth()]
                          } - ${whatsappDate.getFullYear()}`,
                        },
                      },
                    ],
                  },
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: total_amount.toString() },
                      {
                        type: "text",
                        text: "Paaniwale",
                      },
                      { type: "text", text: "Invoice" },
                    ],
                  },
                ],
              },
            }),
          }
        );

        const whatsappData = await whatsappResponse.json();

        if (!whatsappResponse.ok) {
          throw new Error(
            whatsappData?.error?.message || "Failed to send WhatsApp message"
          );
        }

        // DISABLED: Send payment link as separate text message if available
        // if (paymentLinkUrl) {
        //   await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay

        //   const paymentMessageResponse = await fetch(
        //     `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/messages`,
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //         Authorization: config.whatsapp.authorization,
        //       },
        //       body: JSON.stringify({
        //         messaging_product: "whatsapp",
        //         recipient_type: "individual",
        //         to: `91${customer?.customerDetails?.cphone_number}`,
        //         type: "text",
        //         text: {
        //           body: `💳 *Payment Link*\n\nPay online: ${paymentLinkUrl}\n\nAmount: ₹${total_amount}\n\nThank you for your business! 🙏`,
        //         },
        //       }),
        //     }
        //   );

        //   if (!paymentMessageResponse.ok) {
        //     console.error("Failed to send payment link message");
        //   }
        // }

        // Update status to success
        setSendingStatus((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "success",
                  message: "Invoice sent successfully!",
                }
              : item
          )
        );
      } catch (error) {
        console.error(
          `Failed to send invoice to ${customer?.customerDetails?.cname}:`,
          error
        );

        // Update status to failed
        setSendingStatus((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  status: "failed",
                  message: error.message || "Failed to send invoice",
                }
              : item
          )
        );
      }

      // Add a small delay between customers to avoid rate limiting
      if (index < customerInvoice.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setClick(false);

    // Get final status and show summary toast
    setSendingStatus((finalStatus) => {
      const successCount = finalStatus.filter(
        (s) => s.status === "success"
      ).length;
      const failedCount = finalStatus.filter(
        (s) => s.status === "failed"
      ).length;

      if (failedCount === 0) {
        toast({
          title: "Success",
          description: `All ${customerInvoice.length} invoices sent successfully!`,
        });
      } else if (successCount === 0) {
        toast({
          variant: "destructive",
          title: "Failed",
          description: `All ${failedCount} invoices failed to send`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Completed with issues",
          description: `${successCount} succeeded, ${failedCount} failed`,
        });
      }

      return finalStatus;
    });
  };

  return (
    <>
      <div>
        {click ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </Button>
        ) : (
          <Button
            onClick={handleClick}
            variant="default"
            size="sm"
            className="h-8 gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            Send Invoice to All
          </Button>
        )}
      </div>

      {/* Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Sending Invoices</DialogTitle>
            <DialogDescription>
              Progress:{" "}
              {
                sendingStatus.filter(
                  (s) => s.status === "success" || s.status === "failed"
                ).length
              }{" "}
              / {sendingStatus.length} customers
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] w-full pr-4">
            <div className="space-y-3">
              {sendingStatus.map((status, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="mt-0.5">
                    {status.status === "pending" && (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    {status.status === "processing" && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {status.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {status.status === "failed" && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{status.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {status.phone}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        status.status === "failed"
                          ? "text-red-500"
                          : status.status === "success"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {status.message}
                    </p>
                    {/* DISABLED: Payment Link Display
                    {status.paymentLink && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <p className="font-medium text-primary mb-1">
                          Payment Link:
                        </p>
                        <a
                          href={status.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {status.paymentLink}
                        </a>
                      </div>
                    )}
                    */}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setShowStatusDialog(false)}
              disabled={click}
              variant="outline"
            >
              {click ? "Processing..." : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceAll;
