import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useUser } from "@/Context/UserContext";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
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
import { generatePartyOrderPDF } from "@/Handlers/generatePartyOrderPDF";
import { sendPartyOrderWhatsApp } from "@/Handlers/sendPartyOrderWhatsApp";

export function PartyOrderInvoice({ order, open, onClose, onSuccess }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Validate order prop
  if (!order) {
    return null;
  }

  const handlePreview = () => {
    try {
      if (!order) return;
      const pdf = generatePartyOrderPDF(order, user);
      const pdfBlob = pdf.output("blob");

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate preview",
      });
    }
  };

  useEffect(() => {
    if (open && order) {
      handlePreview();
    } else {
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
  }, [open, order?._id]);

  const handleDownload = () => {
    try {
      const pdf = generatePartyOrderPDF(order, user);
      const fileName = `Invoice-${(order.party_name || "Party").replace(
        /\s+/g,
        "-"
      )}-${order._id ? order._id.slice(-8) : "invoice"}.pdf`;
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
    setLoading(true);
    try {
      await sendPartyOrderWhatsApp(order, user);

      toast({
        title: "Success",
        description: `Invoice sent via WhatsApp to +91 ${order.party_phone}!`,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Invoice",
        description: error.message || "Could not send invoice via WhatsApp",
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
                    Generating Invoice Preview...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while the invoice document is rendered.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 py-3 sm:px-6 sm:py-4 border-t bg-muted/30 gap-2 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-center">
            <div className="flex gap-2 w-full sm:w-auto">
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
                Download PDF
              </Button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={handlePreview}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <FileText className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleSendInvoice}
                disabled={loading}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
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
              </Button>
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
