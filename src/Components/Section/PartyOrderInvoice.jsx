import { useState } from "react";
import PropTypes from "prop-types";
import { jsPDF } from "jspdf";
import { useUser } from "@/Context/UserContext";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
// import { createPaymentLink } from "@/Handlers/CreatepaymentLinkHandler"; // DISABLED - No Razorpay
import { updatePartyOrderInvoice } from "@/Handlers/PartyOrderHandler";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/UI/shadcn-UI/dialog";
import { Loader2, FileText, Send, Download } from "lucide-react";
import { config } from "@/Data/config";

export function PartyOrderInvoice({ order, open, onClose, onSuccess }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  console.log("🔵 PartyOrderInvoice component rendered");
  console.log("Props - order:", order);
  console.log("Props - open:", open);
  console.log("User context:", user);

  // Validate order prop
  if (!order) {
    console.error("❌ PartyOrderInvoice: order prop is required");
    return null;
  }

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

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // ============ HEADER SECTION ============
    // Blue header background
    pdf.setFillColor(37, 99, 235); // Blue-600
    pdf.rect(0, 0, pageWidth, 40, "F");

    // Company name and logo
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text(user?.shop_name || "Your Shop Name", 15, 15);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(user?.shop_address || "Shop Address", 15, 23);
    pdf.text("Phone: " + (user?.uid?.phone_number || "N/A"), 15, 29);

    // Logo
    try {
      const logo = new Image();
      logo.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;
      pdf.setFillColor(255, 255, 255);
      pdf.circle(pageWidth - 20, 20, 12, "F");
      pdf.addImage(logo, "PNG", pageWidth - 28, 12, 16, 16);
    } catch (error) {
      console.log("Logo loading error:", error);
    }

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // ============ INVOICE TITLE ============
    let yPos = 50;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("PARTY ORDER INVOICE", 15, yPos);

    // Invoice number box
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(pageWidth - 65, yPos - 7, 50, 20);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text("Invoice Number", pageWidth - 62, yPos - 2);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    const invoiceNum = "PO-" + order._id.slice(-8).toUpperCase();
    pdf.text(invoiceNum, pageWidth - 62, yPos + 5);

    // Dates
    const currentDate = new Date();
    const deliveryDate = new Date(order.delivery_date);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      "Date: " +
        currentDate.getDate() +
        " " +
        months[currentDate.getMonth()] +
        " " +
        currentDate.getFullYear(),
      pageWidth - 62,
      yPos + 10
    );

    // ============ CUSTOMER DETAILS ============
    yPos = 75;

    // Bill To Section
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.rect(15, yPos, 85, 35);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(37, 99, 235);
    pdf.text("BILL TO", 18, yPos + 6);

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(order.party_name || "N/A", 18, yPos + 13);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("Event: " + (order.event_type || "N/A"), 18, yPos + 19);

    // Address handling with text wrapping
    const addressLines = pdf.splitTextToSize(order.party_address || "N/A", 75);
    pdf.text(addressLines, 18, yPos + 24);

    const addressHeight = addressLines.length * 4;
    pdf.text(
      "Ph: " + (order.party_phone || "N/A"),
      18,
      yPos + 24 + addressHeight
    );

    // Event Details Section
    pdf.rect(pageWidth - 70, yPos, 55, 35);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(37, 99, 235);
    pdf.text("EVENT DETAILS", pageWidth - 67, yPos + 6);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("Delivery Date:", pageWidth - 67, yPos + 13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      deliveryDate.getDate() +
        " " +
        months[deliveryDate.getMonth()] +
        " " +
        deliveryDate.getFullYear(),
      pageWidth - 67,
      yPos + 18
    );

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("Status:", pageWidth - 67, yPos + 24);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(order.status || "Pending", pageWidth - 67, yPos + 29);

    // ============ ORDER ITEMS TABLE ============
    yPos = 120;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Order Details", 15, yPos);

    yPos += 6;

    // Table header
    pdf.setFillColor(37, 99, 235);
    pdf.rect(15, yPos, pageWidth - 30, 8, "F");

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("ITEM DESCRIPTION", 18, yPos + 5.5);
    pdf.text("QTY", pageWidth / 2 - 10, yPos + 5.5);
    pdf.text("RATE", pageWidth / 2 + 20, yPos + 5.5);
    pdf.text("AMOUNT", pageWidth - 35, yPos + 5.5);

    yPos += 8;
    pdf.setTextColor(0, 0, 0);

    // Table border
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);

    // Cold Bottles Row
    if (order.cold_bottle_quantity > 0) {
      pdf.line(15, yPos, pageWidth - 15, yPos);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Cold Water Bottles (Chilled)", 18, yPos + 5);
      pdf.text(
        String(order.cold_bottle_quantity),
        pageWidth / 2 - 10,
        yPos + 5
      );
      pdf.text(
        "Rs. " + String(order.cold_bottle_price),
        pageWidth / 2 + 20,
        yPos + 5
      );

      const coldTotal = order.cold_bottle_quantity * order.cold_bottle_price;
      pdf.setFont("helvetica", "bold");
      pdf.text("Rs. " + String(coldTotal), pageWidth - 35, yPos + 5);

      yPos += 8;
    }

    // Normal Bottles Row
    if (order.normal_bottle_quantity > 0) {
      pdf.line(15, yPos, pageWidth - 15, yPos);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("Normal Water Bottles (Room Temp)", 18, yPos + 5);
      pdf.text(
        String(order.normal_bottle_quantity),
        pageWidth / 2 - 10,
        yPos + 5
      );
      pdf.text(
        "Rs. " + String(order.normal_bottle_price),
        pageWidth / 2 + 20,
        yPos + 5
      );

      const normalTotal =
        order.normal_bottle_quantity * order.normal_bottle_price;
      pdf.setFont("helvetica", "bold");
      pdf.text("Rs. " + String(normalTotal), pageWidth - 35, yPos + 5);

      yPos += 8;
    }

    // Table bottom border
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPos, pageWidth - 15, yPos);

    // ============ TOTALS SECTION ============
    yPos += 8;

    // Subtotal calculations
    const totalBottles =
      (order.cold_bottle_quantity || 0) + (order.normal_bottle_quantity || 0);
    const subtotal = order.total_amount || 0;

    // Total bottles
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("Total Bottles:", pageWidth - 75, yPos);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(totalBottles), pageWidth - 35, yPos);

    yPos += 8;

    // Grand Total
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(1);
    pdf.rect(pageWidth - 80, yPos - 4, 65, 10);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("GRAND TOTAL:", pageWidth - 77, yPos + 3);

    pdf.setFontSize(13);
    pdf.setTextColor(22, 163, 74); // Green-600
    pdf.text("Rs. " + String(subtotal), pageWidth - 35, yPos + 3);

    // ============ SPECIAL INSTRUCTIONS ============
    if (order.notes && order.notes.trim()) {
      yPos += 18;

      pdf.setDrawColor(251, 191, 36);
      pdf.setLineWidth(0.5);
      pdf.rect(15, yPos, pageWidth - 30, 25);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(161, 98, 7);
      pdf.text("SPECIAL INSTRUCTIONS", 18, yPos + 6);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      const notesLines = pdf.splitTextToSize(order.notes, pageWidth - 40);
      pdf.text(notesLines, 18, yPos + 12);

      yPos += 25;
    }

    // ============ FOOTER ============
    yPos = pageHeight - 40;

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(15, yPos, pageWidth - 15, yPos);

    yPos += 6;

    // Thank you message
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(34, 197, 94);
    pdf.text("Thank you for your business!", 15, yPos);

    yPos += 8;

    // Contact information
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text("For any queries, please contact:", 15, yPos);

    yPos += 5;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Email: " + (user?.uid?.email || "contact@example.com"), 15, yPos);
    pdf.text("Phone: " + (user?.uid?.phone_number || "N/A"), 15, yPos + 5);

    // Company branding
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(150, 150, 150);
    pdf.text("Powered by PaaaniWale", pageWidth / 2 - 25, pageHeight - 8);

    // QR Code or shop image
    if (user?.image_url) {
      try {
        const img = new Image();
        img.src = user.image_url;
        pdf.addImage(img, "PNG", pageWidth - 35, yPos - 6, 20, 20);
      } catch (error) {
        console.log("QR image error:", error);
      }
    }

    return pdf;
  };

  const handlePreview = () => {
    console.log("🔍 Preview button clicked");
    console.log("Order data:", order);
    console.log("User data:", user);

    try {
      if (!order) {
        console.error("❌ No order data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "No order data available",
        });
        return;
      }

      if (!user) {
        console.error("❌ No user data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "User information not available",
        });
        return;
      }

      console.log("✅ Validation passed, generating PDF...");
      const pdf = generatePDF();
      console.log("✅ PDF generated successfully");

      const pdfBlob = pdf.output("blob");
      console.log("✅ PDF blob created, size:", pdfBlob.size);

      // Revoke old URL if it exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        console.log("🗑️ Old PDF URL revoked");
      }

      const url = URL.createObjectURL(pdfBlob);
      console.log("✅ New blob URL created:", url);
      setPdfUrl(url);

      toast({
        title: "Preview Generated",
        description: "PDF preview is ready",
      });
    } catch (error) {
      console.error("❌ Error generating preview:", error);
      console.error("Error stack:", error.stack);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate preview",
      });
    }
  };

  const handleDownload = () => {
    try {
      const pdf = generatePDF();
      const fileName = `Invoice-${order.party_name.replace(
        /\s+/g,
        "-"
      )}-${order._id.slice(-8)}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Download Started",
        description: "Invoice PDF is being downloaded",
      });
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to download PDF",
      });
    }
  };

  const handleSendInvoice = async () => {
    console.log("📤 Send Invoice button clicked");
    console.log("Order data:", order);
    console.log("User data:", user);

    if (!order) {
      console.error("❌ No order data");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No order data available",
      });
      return;
    }

    if (!user) {
      console.error("❌ No user data");
      toast({
        variant: "destructive",
        title: "Error",
        description: "User information not available",
      });
      return;
    }

    if (!order.party_phone || order.party_phone.length !== 10) {
      console.error("❌ Invalid phone number:", order.party_phone);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid phone number",
      });
      return;
    }

    console.log("✅ Validation passed, starting send process...");
    setLoading(true);

    try {
      // Generate PDF
      console.log("Generating PDF for order:", order._id);
      const pdf = generatePDF();
      const pdfBlob = pdf.output("blob");
      console.log("PDF generated, size:", pdfBlob.size);

      // Convert to base64
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      console.log("PDF converted to base64");

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", `data:application/pdf;base64,${base64data}`);
      formData.append("upload_preset", config.cloud.uploadPreset);
      formData.append("folder", "Paaniwale-Party-Invoices");

      console.log("Uploading to Cloudinary...");
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloud.name}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Cloudinary upload failed:", errorText);
        throw new Error("Failed to upload PDF to Cloudinary");
      }

      const uploadData = await uploadResponse.json();
      console.log("PDF uploaded successfully:", uploadData.secure_url);

      // DISABLED: Create payment link
      // let paymentLinkUrl = "";
      // try {
      //   const currentDate = new Date();
      //   const paymentLinkData = await createPaymentLink({
      //     amount: order.total_amount,
      //     description: `Party Order - ${order.event_type} - ${
      //       months[currentDate.getMonth()]
      //     } ${currentDate.getFullYear()}`,
      //     customer_email: "",
      //     customer_name: order.party_name,
      //     customer_phone: order.party_phone,
      //     smsnotify: true,
      //     emailnotify: false,
      //     reminder_enable: true,
      //     account_number: user?.account_number || "",
      //   });

      //   if (paymentLinkData?.data?.short_url) {
      //     paymentLinkUrl = paymentLinkData.data.short_url;
      //   }
      // } catch (paymentError) {
      //   console.error("Payment link creation failed:", paymentError);
      // }

      // Send WhatsApp invoice
      const whatsappDate = new Date();
      console.log("Sending WhatsApp invoice to:", order.party_phone);

      const invoiceResponse = await fetch(
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
            to: `91${order.party_phone}`,
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
                        filename: `${order.event_type}-${
                          months[whatsappDate.getMonth()]
                        }-${whatsappDate.getFullYear()}`,
                      },
                    },
                  ],
                },
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: order.total_amount.toString() },
                    { type: "text", text: "Paaniwale" },
                    { type: "text", text: "Party Order Invoice" },
                  ],
                },
              ],
            },
          }),
        }
      );

      if (!invoiceResponse.ok) {
        const errorText = await invoiceResponse.text();
        console.error("WhatsApp send failed:", errorText);
        throw new Error("Failed to send invoice via WhatsApp");
      }

      const invoiceResult = await invoiceResponse.json();
      console.log("Invoice sent successfully:", invoiceResult);

      // DISABLED: Send payment link if available
      // if (paymentLinkUrl) {
      //   console.log("Sending payment link:", paymentLinkUrl);
      //   await new Promise((resolve) => setTimeout(resolve, 1000));

      //   const paymentResponse = await fetch(
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
      //         to: `91${order.party_phone}`,
      //         type: "text",
      //         text: {
      //           body: `💳 *Payment Link*\n\nPay online: ${paymentLinkUrl}\n\nAmount: ₹${order.total_amount}\n\nThank you for your business! 🙏`,
      //         },
      //       }),
      //     }
      //   );

      //   if (!paymentResponse.ok) {
      //     console.error("Payment link send failed, but continuing...");
      //   } else {
      //     const paymentResult = await paymentResponse.json();
      //     console.log("Payment link sent successfully:", paymentResult);
      //   }
      // }

      // Update invoice status
      console.log("Updating invoice status...");
      await updatePartyOrderInvoice(order._id, ""); // No payment link

      toast({
        title: "Success",
        description: "Invoice sent successfully!",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-muted/50 shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            Party Order Invoice
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Preview and send invoice for {order.party_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-muted/10">
          {pdfUrl ? (
            <div className="mx-auto max-w-4xl">
              <div className="relative rounded-lg overflow-hidden border-2 border-border shadow-2xl bg-white">
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                  className="w-full h-[500px] sm:h-[600px] lg:h-[700px]"
                  title="Invoice Preview"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] sm:h-[600px] border-2 border-dashed rounded-lg bg-background">
              <div className="flex flex-col items-center gap-4 p-6 text-center max-w-md">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Generate Invoice Preview
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click the &quot;Preview&quot; button below to generate and
                    view the professionally formatted invoice PDF
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 py-3 sm:px-6 sm:py-4 border-t bg-muted/30 gap-2 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!pdfUrl || loading}
                className="flex-1 sm:flex-none"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="flex gap-2 flex-1">
              <Button
                variant="secondary"
                onClick={handlePreview}
                disabled={loading}
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                {pdfUrl ? "Refresh" : "Preview"}
              </Button>
              {/* Disabled temporarily */}
              {/* <Button
                onClick={handleSendInvoice}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send WhatsApp
                  </>
                )}
              </Button> */}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

PartyOrderInvoice.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    party_name: PropTypes.string.isRequired,
    party_phone: PropTypes.string.isRequired,
    party_address: PropTypes.string.isRequired,
    party_location: PropTypes.string,
    event_type: PropTypes.string.isRequired,
    delivery_date: PropTypes.string.isRequired,
    cold_bottle_quantity: PropTypes.number,
    cold_bottle_price: PropTypes.number,
    normal_bottle_quantity: PropTypes.number,
    normal_bottle_price: PropTypes.number,
    total_amount: PropTypes.number.isRequired,
    notes: PropTypes.string,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
