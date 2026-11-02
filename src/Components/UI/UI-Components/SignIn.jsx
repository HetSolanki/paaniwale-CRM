import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../shadcn-UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../shadcn-UI/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/UI/shadcn-UI/form";
import { Input } from "../shadcn-UI/input";
import { Badge } from "../shadcn-UI/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/Context/UserContext";
import {
  Loader2,
  ShieldCheck,
  TrendingUp,
  Truck,
  Package,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Smartphone,
  Lock,
  Phone,
} from "lucide-react";
import { useToast } from "../shadcn-UI/use-toast";
import { Toaster } from "../shadcn-UI/toaster";
import { signinuser } from "@/Handlers/SignInHandler";
import paaniwaleLogo from "@/assets/paniwalalogo.png";
import SEO from "@/Components/SEO";

const formSchema = z.object({
  phone_number: z
    .string({
      message: "Phone Number is required",
    })
    .min(10, {
      message: "Phone Number must be 10 digits",
    })
    .max(10, {
      message: "Phone Number must be 10 digits",
    })
    .regex(/^[0-9]*$/, {
      message: "Phone Number must contain only numbers",
    }),
  password: z
    .string({
      message: "Password is required",
    })
    .min(1, {
      message: "Password is required",
    }),
});

export default function SignIn() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: localStorage.getItem("phone_number") || "",
      password: localStorage.getItem("password") || "",
    },
  });

  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem("phone_number"))
  );
  const { toast } = useToast();

  const formSubmit = async (data) => {
    try {
      setLoading(true);
      const signin = await signinuser(data);

      if (signin.success === true) {
        localStorage.setItem("token", signin.token);
        refetchUser();

        if (rememberMe) {
          localStorage.setItem("phone_number", data.phone_number);
          localStorage.setItem("password", data.password);
        } else {
          localStorage.removeItem("phone_number");
          localStorage.removeItem("password");
        }

        toast({
          title: "Welcome Back!",
          description: "Logged in successfully. Redirecting...",
        });

        if (signin.is_admin === true) {
          localStorage.setItem("is_admin", signin.is_admin);
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 600);
        } else {
          localStorage.setItem("is_admin", signin.is_admin);
          setTimeout(() => {
            navigate("/dashboard");
          }, 600);
        }
      } else if (signin.data === "Invalid Credentials") {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid phone number or password. Please verify and try again.",
        });
      } else if (signin.data === "Invalid Phone Number") {
        toast({
          variant: "destructive",
          title: "Account Not Found",
          description: "No account registered with this phone number.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: signin.message || signin.data || "An unexpected error occurred",
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: error.message || "Failed to sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Distributor Sign In — PaaniWale CRM"
        description="Sign in to your PaaniWale distributor account to manage water routes, customer entries, and billing."
      />

      <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
        {/* Left Side - Professional Branding & Value Proposition */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-black text-slate-100 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <img src={paaniwaleLogo} alt="PaaniWale" className="h-9 w-9 object-contain" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">
                PaaniWale
              </span>
              <Badge variant="outline" className="text-[10px] py-0 bg-primary/20 text-blue-300 border-primary/30">
                Distributor OS
              </Badge>
            </div>
          </div>

          {/* Central Hero Showcase */}
          <div className="relative z-10 max-w-lg space-y-6">
            <Badge variant="secondary" className="bg-slate-800 text-blue-300 border-slate-700 text-xs px-3 py-1 font-medium">
              Enterprise Water Delivery ERP
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Manage routes, deliveries, and collections with confidence.
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Designed specifically for water bottle distributors across India to eliminate manual paper ledgers, prevent unreturned empty jar losses, and automate WhatsApp billing.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Sequenced Route Optimization</p>
                  <p className="text-[11px] text-slate-400">Follow ordered delivery stops to cut travel time & fuel costs</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Dual Empty Bottle Reconciliation</p>
                  <p className="text-[11px] text-slate-400">Track bottles delivered vs empty cans collected at every stop</p>
                </div>
              </div>
            </div>

            {/* Distributor Quote */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs italic text-slate-300">
                &quot;We send over 250 WhatsApp invoices with UPI payment links in under 5 minutes at month-end. It completely transformed our cash flow.&quot;
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-white">Mahesh Solanki</span> • Shreeji Aqua Distributors, Surat
              </div>
            </div>
          </div>

          {/* Security Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              256-bit Encrypted Multi-Tenant Cloud
            </span>
            <span>Version 2.4.0</span>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Website
              </Button>
            </Link>

            <Link to="/customerportal/login">
              <Button variant="outline" size="sm" className="text-xs font-medium">
                <Smartphone className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Customer Portal
              </Button>
            </Link>
          </div>

          {/* Centered Sign In Card */}
          <div className="w-full max-w-md mx-auto my-auto py-8">
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 lg:hidden mb-4">
                <img src={paaniwaleLogo} alt="PaaniWale" className="h-8 w-8 object-contain" />
                <span className="font-bold text-lg text-foreground">PaaniWale CRM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Distributor Sign In
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Enter your credentials to manage your water delivery operations
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(formSubmit)} className="space-y-4">
                {/* Phone Number Field */}
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <div className="flex rounded-md border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 overflow-hidden h-11">
                          <span className="inline-flex items-center px-3.5 border-r border-input bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
                            +91
                          </span>
                          <input
                            type="tel"
                            placeholder="98765 43210"
                            {...field}
                            maxLength={10}
                            className="flex-1 px-3 py-2 text-sm bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground font-mono tracking-wide text-foreground"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-xs font-semibold text-foreground">
                          Password
                        </FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your account password"
                            {...field}
                            className="pr-10 text-sm h-11"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    Remember this device
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </Button>
              </form>
            </Form>

            {/* Switch / Footer Links */}
            <div className="mt-8 space-y-4 pt-6 border-t text-center text-xs text-muted-foreground">
              <p>
                Don&apos;t have an account?{" "}
                <Link to="/signupdp" className="font-semibold text-primary hover:underline">
                  Start 14-Day Free Trial
                </Link>
              </p>

              <div className="p-3 rounded-lg border bg-muted/30 text-left flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-xs">Are you a water customer?</p>
                  <p className="text-[11px] text-muted-foreground">
                    Log in with your phone to view daily bottle deliveries and invoices.
                  </p>
                  <Link
                    to="/customerportal/login"
                    className="inline-block text-xs font-semibold text-primary hover:underline pt-1"
                  >
                    Go to Customer Portal Login →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Bottom Copyright */}
          <div className="text-center text-xs text-muted-foreground py-2 max-w-md mx-auto">
            © {new Date().getFullYear()} PaaniWale Technologies • All rights reserved
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
