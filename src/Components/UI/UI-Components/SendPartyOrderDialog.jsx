import { useState } from "react";
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
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { sanitizePhoneNumber } from "@/lib/utils";
import { sendPartyOrderWhatsApp } from "@/Handlers/sendPartyOrderWhatsApp";

export function SendPartyOrderDialog({ order, open, onClose, onSuccess }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const rawPhone = order.party_phone;
  const cleanPhone = sanitizePhoneNumber(rawPhone);
  const isValidPhone = cleanPhone && cleanPhone.length === 10;

  const handleSend = async () => {
    if (!isValidPhone) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: `"${rawPhone}" is not a valid 10-digit mobile number. Please edit the order to update the phone number.`,
      });
      return;
    }

    setLoading(true);
    try {
      await sendPartyOrderWhatsApp(order, user);

      toast({
        title: "Invoice Sent Successfully",
        description: `WhatsApp message with PDF invoice has been sent to +91 ${cleanPhone}`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send Invoice",
        description: error.message || "An unexpected error occurred while sending the invoice.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            Send Party Order Invoice
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Generate and dispatch the PDF invoice directly to the customer via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Party / Customer:</span>
            <span className="font-semibold text-foreground">{order.party_name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Event Type:</span>
            <span className="font-medium capitalize">{order.event_type}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Delivery Date:</span>
            <span className="font-medium">
              {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">WhatsApp Number:</span>
            <span className="font-mono font-medium flex items-center gap-1.5">
              {isValidPhone ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  +91 {cleanPhone}
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-semibold">{rawPhone || "Missing"}</span>
                </>
              )}
            </span>
          </div>
          <div className="pt-2 border-t flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Total Bill Amount:</span>
            <span className="text-lg font-bold text-emerald-600">₹{order.total_amount || 0}</span>
          </div>
        </div>

        {!isValidPhone && (
          <p className="text-xs text-destructive mb-2">
            ⚠️ Phone number format is invalid. Please edit this order and enter a valid 10-digit mobile number before sending.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !isValidPhone}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invoice...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Confirm & Send via WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

SendPartyOrderDialog.propTypes = {
  order: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
