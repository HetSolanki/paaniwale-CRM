import { useState } from "react";
import PropTypes from "prop-types";
import { jsPDF } from "jspdf";
import { useUser } from "@/Context/UserContext";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { createPaymentLink } from "@/Handlers/CreatepaymentLinkHandler";
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
import { Loader2, FileText, Send } from "lucide-react";
import { config } from "@/Data/meta";

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

    // Shop details
    pdf.setFontSize(24);
    pdf.setFont("Helvetica-Bold", "bold");
    pdf.text(`${user?.shop_name || "Shop Name"}`, 15, 15);
    pdf.setFontSize(16);
    pdf.setFont("Helvetica-Bold", "bold");
    pdf.text("Address:", 15, 25);
    pdf.setFont("Helvetica", "normal");
    pdf.text(`${user?.shop_address || "Shop Address"}`, 38, 25);

    // Logo
    const logo = new Image();
    logo.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;
    pdf.addImage(logo, "png", 180, 10, 20, 20);

    // Invoice type
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 102, 204);
    pdf.text("EVENT ORDER INVOICE", 15, 40);
    pdf.setTextColor(0, 0, 0);

    // Invoice details
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice #", 145, 45);
    pdf.setFont("helvetica", "normal");
    const invoiceNum = `PO-${order._id.slice(-8).toUpperCase()}`;
    pdf.text(invoiceNum, 145, 52);

    // Party details
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Bill to:", 15, 55);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${order.party_name}`, 15, 62);
    pdf.text(`Event: ${order.event_type}`, 15, 69);
    pdf.text(`${order.party_address}`, 15, 76);
    if (order.party_location) {
      pdf.text(`${order.party_location}`, 15, 83);
    }
    pdf.text(`${order.party_phone}`, 15, order.party_location ? 90 : 83);

    // Invoice dates
    const currentDate = new Date();
    const deliveryDate = new Date(order.delivery_date);

    pdf.setFontSize(12);
    pdf.text(
      `Invoice date: ${currentDate.getDate()}-${
        months[currentDate.getMonth()]
      }-${currentDate.getFullYear()}`,
      145,
      59
    );
    pdf.text(
      `Delivery date: ${deliveryDate.getDate()}-${
        months[deliveryDate.getMonth()]
      }-${deliveryDate.getFullYear()}`,
      145,
      66
    );

    // Order Details Table
    let yOffset = 105;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Order Details:", 15, yOffset);
    yOffset += 10;

    // Table headers
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Item", 15, yOffset);
    pdf.text("Quantity", 100, yOffset);
    pdf.text("Price/Unit", 130, yOffset);
    pdf.text("Amount", 170, yOffset);

    yOffset += 7;
    pdf.setLineWidth(0.5);
    pdf.line(15, yOffset, 195, yOffset);
    yOffset += 7;

    // Cold Bottles
    if (order.cold_bottle_quantity > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.text("Cold Bottles", 15, yOffset);
      pdf.text(order.cold_bottle_quantity.toString(), 100, yOffset);
      pdf.text(`₹${order.cold_bottle_price}`, 130, yOffset);
      const coldTotal = order.cold_bottle_quantity * order.cold_bottle_price;
      pdf.text(`₹${coldTotal}`, 170, yOffset);
      yOffset += 7;
    }

    // Normal Bottles
    if (order.normal_bottle_quantity > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.text("Normal Bottles", 15, yOffset);
      pdf.text(order.normal_bottle_quantity.toString(), 100, yOffset);
      pdf.text(`₹${order.normal_bottle_price}`, 130, yOffset);
      const normalTotal =
        order.normal_bottle_quantity * order.normal_bottle_price;
      pdf.text(`₹${normalTotal}`, 170, yOffset);
      yOffset += 7;
    }

    yOffset += 5;
    pdf.setLineWidth(0.5);
    pdf.line(15, yOffset, 195, yOffset);
    yOffset += 10;

    // Total section
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Bottles:", 15, yOffset);
    const totalBottles =
      (order.cold_bottle_quantity || 0) + (order.normal_bottle_quantity || 0);
    pdf.text(totalBottles.toString(), 100, yOffset);
    yOffset += 10;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Grand Total:", 15, yOffset);
    pdf.setTextColor(0, 128, 0);
    pdf.text(`Rs. ${order.total_amount}`, 170, yOffset);
    pdf.setTextColor(0, 0, 0);
    yOffset += 15;

    // Notes
    if (order.notes) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Special Instructions:", 15, yOffset);
      yOffset += 7;
      pdf.setFont("helvetica", "normal");
      const splitNotes = pdf.splitTextToSize(order.notes, 180);
      pdf.text(splitNotes, 15, yOffset);
      yOffset += splitNotes.length * 7 + 10;
    }

    // Footer
    yOffset = Math.max(yOffset, 240);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Thank you for your business!", 15, yOffset);
    yOffset += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0, 0.5);
    pdf.text("For any queries, please contact us:", 15, yOffset);

    // QR or Shop image
    const img = new Image();
    img.src = user?.image_url || "";
    if (user?.image_url) {
      pdf.addImage(img, "png", 130, yOffset + 5, 50, 50);
    }

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    yOffset += 10;
    pdf.text(`${user?.uid?.phone_number || ""}`, 15, yOffset);
    yOffset += 7;
    pdf.text(`${user?.uid?.email || ""}`, 15, yOffset);
    yOffset += 15;

    pdf.setTextColor(0, 0, 0, 0.5);
    pdf.setFont("helvetica", "italic");
    pdf.text("http://128.199.19.208:3000/", 15, yOffset);

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

      // Create payment link
      let paymentLinkUrl = "";
      try {
        const currentDate = new Date();
        const paymentLinkData = await createPaymentLink({
          amount: order.total_amount,
          description: `Party Order - ${order.event_type} - ${
            months[currentDate.getMonth()]
          } ${currentDate.getFullYear()}`,
          customer_email: "",
          customer_name: order.party_name,
          customer_phone: order.party_phone,
          smsnotify: true,
          emailnotify: false,
          reminder_enable: true,
          account_number: user?.account_number || "",
        });

        if (paymentLinkData?.data?.short_url) {
          paymentLinkUrl = paymentLinkData.data.short_url;
        }
      } catch (paymentError) {
        console.error("Payment link creation failed:", paymentError);
      }

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

      // Send payment link if available
      if (paymentLinkUrl) {
        console.log("Sending payment link:", paymentLinkUrl);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const paymentResponse = await fetch(
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
              type: "text",
              text: {
                body: `💳 *Payment Link*\n\nPay online: ${paymentLinkUrl}\n\nAmount: ₹${order.total_amount}\n\nThank you for your business! 🙏`,
              },
            }),
          }
        );

        if (!paymentResponse.ok) {
          console.error("Payment link send failed, but continuing...");
        } else {
          const paymentResult = await paymentResponse.json();
          console.log("Payment link sent successfully:", paymentResult);
        }
      }

      // Update invoice status
      console.log("Updating invoice status...");
      await updatePartyOrderInvoice(order._id, paymentLinkUrl);

      toast({
        title: "Success",
        description: paymentLinkUrl
          ? "Invoice & payment link sent successfully!"
          : "Invoice sent successfully!",
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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Party Order Invoice</DialogTitle>
          <DialogDescription>
            Preview and send invoice for {order.party_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[500px] border rounded"
              title="Invoice Preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] border rounded bg-muted/30">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Click &quot;Preview&quot; to generate invoice
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handlePreview}
            disabled={loading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSendInvoice} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send via WhatsApp
              </>
            )}
          </Button>
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
