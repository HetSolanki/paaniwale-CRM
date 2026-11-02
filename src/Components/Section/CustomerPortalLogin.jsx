import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/UI/shadcn-UI/card";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { Toaster } from "@/Components/UI/shadcn-UI/toaster";
import {
  Loader2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  MessageSquare,
  Package,
  Calendar,
  FileText,
  ExternalLink,
} from "lucide-react";
import { config } from "@/Data/config";
import { sanitizePhoneNumber } from "@/lib/utils";
import paaniwaleLogo from "@/assets/paniwalalogo.png";
import SEO from "../SEO";

export default function CustomerPortalLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
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
          title: "Code Dispatched!",
          description: `6-digit verification code sent via WhatsApp to +91 ${cleanPhone}`,
        });
        setStep("otp");
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Send OTP",
          description:
            data.message ||
            "Could not dispatch verification code. Please check your number or try again.",
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
        description: "Please enter the complete 6-digit verification code",
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
          title: "Verified Successfully!",
          description: "Opening your delivery ledger...",
        });

        setTimeout(() => {
          navigate("/customerportal/dashboard");
        }, 600);
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

  return (
    <>
      <SEO
        title="Customer Portal Login — PaaniWale"
        description="Access your daily water jar delivery ledger, verify bottle counts, and download official invoices."
      />

      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col justify-between text-foreground">
        {/* Navigation Bar */}
        <header className="w-full border-b bg-background/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={paaniwaleLogo} alt="PaaniWale" className="h-8 w-8 object-contain" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-foreground">
                  PaaniWale
                </span>
                <Badge variant="outline" className="text-[10px] py-0 bg-primary/10 text-primary border-primary/20">
                  Customer Portal
                </Badge>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/signin" className="hidden sm:inline-block">
                <Button variant="outline" size="sm" className="text-xs">
                  Distributor Login
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Card Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-10">
          <div className="w-full max-w-md space-y-6">
            <Card className="border shadow-lg bg-card">
              <CardHeader className="space-y-2 text-center pb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {step === "phone" ? (
                    <Phone className="h-6 w-6" />
                  ) : (
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                  {step === "phone" ? "Customer Delivery Portal" : "Enter Verification Code"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                  {step === "phone"
                    ? "Enter your mobile number registered with your water distributor to receive an instant WhatsApp code."
                    : `Enter the 6-digit OTP code sent to your WhatsApp at +91 ${sanitizePhoneNumber(phoneNumber)}`}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2">
                {step === "phone" ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                        Registered Mobile Number
                      </Label>
                      <div className="flex rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 overflow-hidden h-11">
                        <span className="inline-flex items-center px-3.5 border-r border-input bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
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
                          required
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1.5">
                        <MessageSquare className="h-3 w-3 text-primary shrink-0" />
                        We will send a 6-digit login code to your WhatsApp
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !phoneNumber}
                      className="w-full h-11 font-medium text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending WhatsApp Code...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send WhatsApp OTP
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="otp" className="text-xs font-semibold text-foreground text-center block">
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
                        className="text-2xl text-center tracking-[0.4em] h-14 font-mono font-bold"
                        autoFocus
                      />
                      <p className="text-[11px] text-muted-foreground text-center mt-1">
                        Please check your WhatsApp inbox from PaaniWale
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full h-11 font-medium text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying Code...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Verify & Open My Portal
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
                          className="text-xs text-primary h-8 px-2 font-medium"
                          onClick={() => handleSendOTP()}
                          disabled={loading}
                        >
                          Resend Code
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>

              <CardFooter className="flex flex-col border-t bg-muted/20 p-4 space-y-2 text-xs">
                <div className="w-full space-y-1.5 text-muted-foreground">
                  <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                    In your Customer Portal:
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Verify daily 20L water bottle drop counts & dates
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Check empty bottle balance & outstanding dues
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Download official monthly statements in 1 click
                  </p>
                </div>
              </CardFooter>
            </Card>

            <div className="text-center text-xs text-muted-foreground">
              Are you a water delivery distributor?{" "}
              <Link to="/signin" className="font-semibold text-primary hover:underline">
                Business Sign In →
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 border-t bg-background text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PaaniWale Technologies • Customer Transparency Portal</p>
        </footer>
      </div>
      <Toaster />
    </>
  );
}
