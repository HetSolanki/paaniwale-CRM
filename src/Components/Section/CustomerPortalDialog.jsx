import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/UI/shadcn-UI/dialog";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { Toaster } from "@/Components/UI/shadcn-UI/toaster";
import { Loader2, Phone, ShieldCheck, CheckCircle2, MessageSquare, ArrowLeft } from "lucide-react";
import { config } from "@/Data/config";
import { sanitizePhoneNumber } from "@/lib/utils";

export default function CustomerPortalDialog({ open, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // phone, otp
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();

    const cleanPhone = sanitizePhoneNumber(phoneNumber);

    if (!cleanPhone || cleanPhone.length !== 10) {
      toast({
        variant: "destructive",
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${config.baseUrl}/api/customerportal/portal/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone_number: cleanPhone }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        toast({
          title: "Verification Code Sent",
          description: `A 6-digit OTP has been dispatched to +91 ${cleanPhone} via WhatsApp`,
        });
        setStep("otp");
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Send OTP",
          description: data.message || "Could not deliver verification code. Please check your number.",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to reach verification service. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter the complete 6-digit OTP",
      });
      return;
    }

    const cleanPhone = sanitizePhoneNumber(phoneNumber);
    setLoading(true);
    try {
      const response = await fetch(
        `${config.baseUrl}/api/customerportal/portal/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: cleanPhone,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("customerToken", data.token);
        localStorage.setItem("customerPhone", cleanPhone);

        toast({
          title: "Verified Successfully",
          description: "Loading your delivery dashboard...",
        });

        setTimeout(() => {
          onClose();
          navigate("/customerportal/dashboard");
        }, 800);
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: data.message || "Invalid OTP code. Please retry.",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify code. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    setOtp("");
    setStep("phone");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {step === "phone" ? (
                <Phone className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {step === "phone" ? "Customer Portal Access" : "Verify WhatsApp OTP"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {step === "phone"
                ? "Enter your registered mobile number to access your water delivery records"
                : `Enter the 6-digit OTP code sent to your WhatsApp at +91 ${sanitizePhoneNumber(phoneNumber)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                    Registered Mobile Number
                  </Label>
                  <div className="flex rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 overflow-hidden h-10">
                    <span className="inline-flex items-center px-3 border-r border-input bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground font-mono tracking-wide text-foreground"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1.5">
                    <MessageSquare className="h-3 w-3 text-primary shrink-0" />
                    Instant OTP code will be sent to your WhatsApp
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading || !phoneNumber}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send WhatsApp Code
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-xs font-semibold text-foreground">
                    6-Digit Security Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 6) setOtp(val);
                    }}
                    maxLength={6}
                    disabled={loading}
                    className="text-xl text-center tracking-widest h-12 font-mono font-bold"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground text-center">
                    Check your WhatsApp chat from PaaniWale
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Verify & Access Dashboard
                      </>
                    )}
                  </Button>

                  <div className="flex justify-between items-center pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                      }}
                      disabled={loading}
                    >
                      <ArrowLeft className="mr-1 h-3 w-3" />
                      Change Number
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-xs text-primary h-8 px-2"
                      onClick={() => handleSendOTP()}
                      disabled={loading}
                    >
                      Resend Code
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Portal Features Banner */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                In your Customer Portal:
              </p>
              <div className="space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  View real-time calendar of daily delivered water bottles
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Check current monthly bill and download PDF statement
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}

CustomerPortalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
