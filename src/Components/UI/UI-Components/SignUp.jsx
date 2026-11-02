import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../shadcn-UI/button";
import { Input } from "../shadcn-UI/input";
import { Label } from "../shadcn-UI/label";
import { Badge } from "../shadcn-UI/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/UI/shadcn-UI/form";
import { useToast } from "../shadcn-UI/use-toast";
import { Toaster } from "../shadcn-UI/toaster";
import { createUser } from "@/Handlers/SignUpHandler";
import { createShop } from "@/Handlers/AddShop";
import paaniwaleLogo from "@/assets/paniwalalogo.png";
import SEO from "@/Components/SEO";
import {
  Loader2,
  ShieldCheck,
  Truck,
  Package,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  CheckCircle2,
  Store,
  Smartphone,
  Building2,
  ArrowRight,
} from "lucide-react";

const formSchema = z.object({
  fname: z
    .string({ message: "First name is required" })
    .min(1, { message: "First name is required" }),
  lname: z
    .string({ message: "Last name is required" })
    .min(1, { message: "Last name is required" }),
  phone_number: z
    .string({ message: "Phone number is required" })
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only numbers" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be at most 20 characters" })
    .regex(/^(?=.*[A-Z])/, { message: "Must include at least one uppercase letter" })
    .regex(/^(?=.*[a-z])/, { message: "Must include at least one lowercase letter" })
    .regex(/^(?=.*\d)/, { message: "Must include at least one number" })
    .regex(/^(?=.*[!@#$%^&*])/, { message: "Must include a special symbol (!@#$%^&*)" }),
  confirm_password: z.string({ message: "Please confirm your password" }),
});

const shopSchema = z.object({
  shop_name: z
    .string({ message: "Shop name is required" })
    .min(2, { message: "Shop name must be at least 2 characters" }),
  gst_number: z.string().optional(),
});

export default function SignUp() {
  const [currentPage, setCurrentPage] = useState(0); // 0: Account, 1: Shop, 2: Complete
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fname: "",
      lname: "",
      phone_number: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const shopForm = useForm({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shop_name: "",
      gst_number: "",
    },
  });

  const checkValidation = (data) => {
    if (data.password !== data.confirm_password) {
      form.setError("confirm_password", {
        type: "manual",
        message: "Passwords do not match",
      });
      return false;
    }
    return true;
  };

  const formSubmit = async (data) => {
    if (!checkValidation(data)) return;

    setLoading(true);
    try {
      const newUser = await createUser(data);

      if (newUser.status === "success") {
        toast({
          title: "Account Registered Successfully",
          description: "Let's set up your water agency / shop details.",
        });
        localStorage.setItem("token", newUser.token);
        setCurrentPage(1);
      } else if (newUser.status === "failed") {
        toast({
          variant: "destructive",
          title: "Account Already Exists",
          description: newUser.message || "A distributor account with this mobile number already exists.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Unable to create account. Please verify your details and try again.",
        });
      }
    } catch (error) {
      console.error("SignUp Error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to reach the server. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const shopSubmit = async (data) => {
    setLoading(true);
    try {
      const newShop = await createShop(data);
      if (newShop.status === "success") {
        toast({
          title: "Shop Profile Configured",
          description: "Your business details have been saved successfully.",
        });
      }
      setCurrentPage(2);
    } catch (error) {
      console.error("Shop Error:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Shop",
        description: error.message || "Could not save shop information.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Distributor Sign Up — PaaniWale CRM"
        description="Create your distributor account to automate 20L water bottle routes, empty jar tracking, and WhatsApp billing."
      />

      <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
        {/* Left Side - Professional Branding & Value Proposition (Matches SignIn) */}
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
              Start Your 14-Day Free Trial
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Digitize your entire water delivery operations in minutes.
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Join hundreds of water bottle agencies running automated customer ledgers, daily route sheets, and instant monthly WhatsApp invoices with zero paper chaos.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Daily Driver Run Sheets</p>
                  <p className="text-[11px] text-slate-400">Export sequence-ordered drop lists by sector, society, and floor</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Empty Bottle Ledger</p>
                  <p className="text-[11px] text-slate-400">Zero bottle leakages with bottle balance tracking per client</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs italic text-slate-300">
                &quot;Setting up PaaniWale took less than 10 minutes. Our billing errors dropped to zero in the very first month.&quot;
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-white">Rajesh Patel</span> • JalDhara Water Services, Ahmedabad
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

        {/* Right Side - Sign Up Stepper Form */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16">
          {/* Top Bar with Navigation */}
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

          {/* Centered Form Area */}
          <div className="w-full max-w-md mx-auto my-auto py-6">
            {/* Mobile Brand Header */}
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <img src={paaniwaleLogo} alt="PaaniWale" className="h-8 w-8 object-contain" />
              <span className="font-bold text-lg text-foreground">PaaniWale CRM</span>
            </div>

            {/* Modern Minimal Step Indicator */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    currentPage === 0
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : currentPage > 0
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentPage > 0 ? <Check className="h-3.5 w-3.5" /> : "1"}
                </div>
                <span
                  className={`text-xs ${
                    currentPage === 0
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Account
                </span>
              </div>

              <div
                className={`flex-1 h-[2px] mx-2 transition-colors ${
                  currentPage > 0 ? "bg-primary" : "bg-muted"
                }`}
              />

              {/* Step 2 */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    currentPage === 1
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : currentPage > 1
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentPage > 1 ? <Check className="h-3.5 w-3.5" /> : "2"}
                </div>
                <span
                  className={`text-xs ${
                    currentPage === 1
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Shop Profile
                </span>
              </div>

              <div
                className={`flex-1 h-[2px] mx-2 transition-colors ${
                  currentPage > 1 ? "bg-primary" : "bg-muted"
                }`}
              />

              {/* Step 3 */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    currentPage === 2
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs ${
                    currentPage === 2
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Ready
                </span>
              </div>
            </div>

            {/* STEP 0: Account Details */}
            {currentPage === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Create Distributor Account
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Enter your personal and contact details to get started
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(formSubmit)} className="space-y-4">
                    {/* First & Last Name Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="fname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-foreground">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                {...field}
                                className="h-11 text-sm"
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage className="text-[11px]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold text-foreground">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                {...field}
                                className="h-11 text-sm"
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage className="text-[11px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Phone Number Field with Clean +91 Input Group */}
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">
                            Mobile Number
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
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-xs font-semibold text-foreground">
                              Email Address
                            </FormLabel>
                            <span className="text-[10px] text-muted-foreground">Optional</span>
                          </div>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder="name@agency.com"
                              {...field}
                              className="h-11 text-sm"
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password (min 8 chars)"
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
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password Field */}
                    <FormField
                      control={form.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter your password"
                                {...field}
                                className="pr-10 text-sm h-11"
                                disabled={loading}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button - Simple Non-Colorful */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Continue to Shop Setup
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                          to="/signin"
                          className="font-semibold text-primary hover:underline transition-colors"
                        >
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {/* STEP 1: Shop Setup */}
            {currentPage === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Shop & Business Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Set up your water delivery agency name and invoice details
                  </p>
                </div>

                <Form {...shopForm}>
                  <form onSubmit={shopForm.handleSubmit(shopSubmit)} className="space-y-4">
                    <FormField
                      control={shopForm.control}
                      name="shop_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">
                            Agency / Shop Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="e.g. Shreeji Aqua Distributors"
                                {...field}
                                className="h-11 text-sm pl-9"
                                disabled={loading}
                                autoFocus
                              />
                              <Store className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </FormControl>
                          <p className="text-[11px] text-muted-foreground">
                            This name appears on customer bills and WhatsApp messages.
                          </p>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={shopForm.control}
                      name="gst_number"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-xs font-semibold text-foreground">
                              GST Number
                            </FormLabel>
                            <span className="text-[10px] text-muted-foreground">Optional</span>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="24AAAAA0000A1Z5"
                                {...field}
                                className="h-11 text-sm pl-9 font-mono uppercase"
                                disabled={loading}
                              />
                              <Building2 className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Simple Non-Colorful Button */}
                    <div className="pt-2 space-y-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Shop Details...
                          </>
                        ) : (
                          <>
                            Complete Setup & Launch
                            <Check className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentPage(2)}
                        className="w-full text-xs text-muted-foreground hover:text-foreground h-9"
                      >
                        Skip for now
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {/* STEP 2: Complete / All Set */}
            {currentPage === 2 && (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    You&apos;re All Set!
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                    Your PaaniWale distributor account and agency profile have been successfully created.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/40 p-4 text-left space-y-2 max-w-sm mx-auto">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Next Steps:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      Sign in with your registered mobile & password
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      Add your customer drop routes & bottle rates
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      Start recording daily water deliveries
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate("/signin")}
                    className="w-full max-w-sm h-11 font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    Proceed to Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Compliance & Policy */}
          <div className="text-center text-xs text-muted-foreground py-2 border-t">
            By signing up, you agree to PaaniWale&apos;s Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>

      <Toaster />
    </>
  );
}
