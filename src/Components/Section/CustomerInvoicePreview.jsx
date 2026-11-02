import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from "@/Context/UserContext";
import { GetCustomerInvoice } from "@/Handlers/GetCustomerInvoice";
import { pdfGenerator } from "@/Handlers/pdfGenerator";
import { config } from "@/Data/config";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/UI/shadcn-UI/dialog";
import { Loader2, Download, X, Send } from "lucide-react";
import { toast } from "react-toastify";
import { sanitizePhoneNumber } from "@/lib/utils";
import { sendInvoice } from "@/Handlers/sendInvoice";

export function CustomerInvoicePreview({ customerId, open, onClose }) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfData, setPdfData] = useState(null);

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
    if (open && customerId) {
      generatePreview();
    } else {
      // Clean up when dialog closes
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      // Fetch customer invoice data
      const customerInvoiceData = await GetCustomerInvoice(customerId);

      // Check if data exists
      if (!customerInvoiceData?.data || customerInvoiceData.data.length === 0) {
        toast.error("This customer has no delivery entries to invoice.");
        onClose();
        return;
      }

      const customerInvoice = customerInvoiceData.data;

      // Check if customer entry exists
      if (
        !customerInvoice[0]?.customerEntry ||
        customerInvoice[0].customerEntry.length === 0
      ) {
        toast.error("No delivery entries found for this customer");
        onClose();
        return;
      }

      // Calculate total amount
      const totalAmount =
        customerInvoice[0]?.totalBottle *
        customerInvoice[0]?.customerDetails?.bottle_price;

      // Partition customer entries for PDF pages
      const customerEntries = customerInvoice[0]?.customerEntry || [];
      const partitionSize = Math.ceil(customerEntries.length / 3);
      const firstPartCustomers = customerEntries.slice(0, partitionSize);
      const secondPartCustomers = customerEntries.slice(
        partitionSize,
        partitionSize * 2
      );
      const thirdPartCustomers = customerEntries.slice(partitionSize * 2);

      // Pre-load images
      const logoImage = await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn("Failed to load logo image");
          resolve(null);
        };
        img.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;
      });

      const userImage = await new Promise((resolve) => {
        if (!user?.user?.image_url) {
          console.warn("No QR code URL found in user.user.image_url");
          resolve(null);
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          resolve(img);
        };
        img.onerror = (error) => {
          console.error("Failed to load QR code image:", error);
          resolve(null);
        };
        img.src = user.user.image_url;
      });

      // Generate PDF
      const pdf = pdfGenerator(
        user,
        logoImage,
        userImage,
        customerInvoice,
        firstPartCustomers,
        secondPartCustomers,
        thirdPartCustomers,
        totalAmount,
        months
      );

      // Create blob URL for preview
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);

      setPdfUrl(url);
      setPdfData({ pdf, customerInvoice, totalAmount });
    } catch (error) {
      console.error("Failed to generate preview:", error);
      toast.error(error.message || "Failed to generate invoice preview!");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfData?.pdf) {
      const date = new Date();
      const filename = `Invoice-${
        pdfData.customerInvoice[0]?.customerDetails?.cname
      }-${months[date.getMonth()]}-${date.getFullYear()}.pdf`;
      pdfData.pdf.save(filename);
      toast.success("Invoice downloaded successfully!");
    }
  };

  const handleSendWhatsApp = async () => {
    if (!pdfData?.pdf || !pdfData?.customerInvoice) return;
    setSending(true);
    try {
      const rawPhone = pdfData.customerInvoice[0]?.customerDetails?.cphone_number;
      const cleanPhone = sanitizePhoneNumber(rawPhone);

      if (!cleanPhone || cleanPhone.length !== 10) {
        toast.error(`Invalid customer phone number: "${rawPhone || "Missing"}".`);
        return;
      }

      const pdfBlob = pdfData.pdf.output("blob");
      const date = new Date();
      const filename = `Invoice-${
        pdfData.customerInvoice[0]?.customerDetails?.cname || "Customer"
      }-${months[date.getMonth()]}-${date.getFullYear()}.pdf`;

      const formData = new FormData();
      formData.append("file", pdfBlob, filename);
      formData.append("type", "application/pdf");
      formData.append("messaging_product", "whatsapp");

      const uploadRes = await fetch(
        `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/media`,
        {
          method: "POST",
          headers: {
            Authorization: config.whatsapp.authorization,
          },
          body: formData,
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!uploadRes.ok) {
        const uploadError = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadError?.error?.message || "Failed to upload invoice PDF to WhatsApp");
      }

      const { id: mediaId } = await uploadRes.json();

      await sendInvoice(
        pdfData.customerInvoice,
        mediaId,
        filename,
        pdfData.totalAmount
      );

      toast.success(`Invoice sent successfully to +91 ${cleanPhone}!`);
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error(error.message || "Failed to send invoice via WhatsApp");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Customer Invoice Preview</DialogTitle>
          <DialogDescription>
            Preview and verify customer invoice before or after sending
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Generating preview...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[60vh] border rounded-lg"
              title="Invoice Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
              No preview available
            </div>
          )}
        </div>

        <DialogFooter className="p-4 pt-0 gap-2 flex-col sm:flex-row justify-between items-center">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} disabled={loading || sending}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={loading || sending || !pdfData}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>

          <Button
            onClick={handleSendWhatsApp}
            disabled={loading || sending || !pdfData}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {sending ? (
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

CustomerInvoicePreview.propTypes = {
  customerId: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
