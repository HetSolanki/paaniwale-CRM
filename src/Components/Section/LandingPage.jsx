import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../UI/shadcn-UI/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../UI/shadcn-UI/card";
import { Badge } from "../UI/shadcn-UI/badge";
import SEO from "../SEO";
import {
  Truck,
  FileText,
  CreditCard,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  Smartphone,
  Send,
  Loader2,
  Building2,
  BarChart3,
  HelpCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import paaniwaleLogo from "@/assets/paniwalalogo.png";

// Inquiry Form Component
const InquiryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "Business Inquiry",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(`${DOMAIN_NAME}/api/inquiry/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you! Your inquiry has been received. Our team will contact you within 24 hours.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          subject: "Business Inquiry",
          message: "",
          inquiryType: "general",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Failed to submit inquiry. Please try again or call us.",
        });
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setSubmitStatus({
        type: "error",
        message: "Network error. Please try again later or reach out via phone.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitStatus && (
        <div
          className={`p-3.5 rounded-lg text-sm border ${
            submitStatus.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Your Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Ramesh Patel"
            className="w-full px-3.5 py-2 text-sm rounded-md border bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="10-digit mobile number"
            className="w-full px-3.5 py-2 text-sm rounded-md border bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Business / Agency Name
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Shree Ganesh Water Supply"
            className="w-full px-3.5 py-2 text-sm rounded-md border bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@business.com"
            className="w-full px-3.5 py-2 text-sm rounded-md border bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Tell us about your delivery requirements
        </label>
        <textarea
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="How many jars do you deliver daily? What features are you looking for?"
          className="w-full px-3.5 py-2 text-sm rounded-md border bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Inquiry...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Inquiry & Request Callback
          </>
        )}
      </Button>
    </form>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("routes");
  const [dailyBottles, setDailyBottles] = useState(250);
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);

  // ROI Calculations based on volume
  const roiCalculations = useMemo(() => {
    const monthlyBottles = dailyBottles * 28;
    const hoursSavedPerMonth = Math.round((dailyBottles / 50) * 8);
    const unreturnedJarsSaved = Math.round(monthlyBottles * 0.035); // ~3.5% unreturned rate prevented
    const jarLossSavings = unreturnedJarsSaved * 150; // ₹150 per 20L empty jar
    const fasterCollectionRevenue = Math.round(monthlyBottles * 32); // ₹32 average rate

    return {
      monthlyBottles,
      hoursSavedPerMonth,
      unreturnedJarsSaved,
      jarLossSavings,
      fasterCollectionRevenue,
    };
  }, [dailyBottles]);

  const faqs = [
    {
      q: "How does 1-click WhatsApp invoicing work?",
      a: "At month-end or whenever required, PaaniWale generates a high-resolution, itemized PDF invoice with your shop logo, bank QR code, and customer delivery ledger. With one click, it sends the PDF directly to the customer's WhatsApp number with a summary and UPI payment link.",
    },
    {
      q: "Can my delivery staff use it without internet?",
      a: "Yes. PaaniWale is engineered as an offline-first Progressive Web App (PWA). Delivery drivers can open the app on mobile, mark jars delivered and empty jars collected in basements or low-network zones, and data automatically syncs once connection is restored.",
    },
    {
      q: "How does the Customer Portal benefit my clients?",
      a: "Instead of calling you repeatedly to ask 'how many bottles did you deliver this month?', your customers simply enter their phone number on the Customer Portal to view their exact calendar drops, empty bottle balance, and download their official bills anytime.",
    },
    {
      q: "How do Party & Event Orders differ from daily deliveries?",
      a: "Event orders for marriages, catering, and corporate parties have distinct requirements. PaaniWale provides a specialized workflow with separate pricing for chilled (cold) bottles vs room-temperature jars, custom delivery venues, and dedicated event invoicing.",
    },
    {
      q: "Is my customer data safe and private?",
      a: "Absolutely. PaaniWale uses strict multi-tenant architecture with encrypted JWT authentication. Your customer lists, delivery addresses, pricing, and revenue records are completely isolated and inaccessible to any other user.",
    },
  ];

  return (
    <>
      <SEO
        title="PaaniWale CRM — The Modern Operating System for Water Delivery Businesses"
        description="Digitize water bottle routes, automate WhatsApp invoicing, track empty jars, and collect instant UPI payments for water jar distributors across India."
        keywords="water delivery software, water jar crm, bottle delivery app, 20L water can distributor, paaniwale"
      />

      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={paaniwaleLogo}
                alt="PaaniWale"
                className="h-9 w-9 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-foreground flex items-center gap-1.5">
                  PaaniWale
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    CRM
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Water Delivery ERP
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#solutions"
                className="hover:text-foreground transition-colors"
              >
                Solutions
              </a>
              <a
                href="#calculator"
                className="hover:text-foreground transition-colors"
              >
                ROI Calculator
              </a>
              <a
                href="#faq"
                className="hover:text-foreground transition-colors"
              >
                FAQ
              </a>
              <a
                href="#contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/customerportal/login")}
                className="text-xs sm:text-sm font-medium border-border hover:bg-muted"
              >
                <Smartphone className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Customer Portal
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/signin")}
                className="text-xs sm:text-sm hidden sm:inline-flex"
              >
                Sign In
              </Button>

              <Button
                size="sm"
                onClick={() => navigate("/signupdp")}
                className="text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Free
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50 -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/60 text-xs font-medium text-muted-foreground mb-6 shadow-sm">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[11px] py-0">
                New v2.0
              </Badge>
              <span>Automated WhatsApp Invoicing & Empty Jar Ledger</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
              The Modern Operating System for{" "}
              <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                Water Jar Delivery
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Digitize route sequences, eliminate manual diary bookkeeping, stop unreturned 20L jar losses, and dispatch professional WhatsApp bills with instant UPI payment links.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <Button
                size="lg"
                onClick={() => navigate("/signupdp")}
                className="w-full sm:w-auto font-semibold px-7 shadow-sm text-sm"
              >
                Start Free 14-Day Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/customerportal/login")}
                className="w-full sm:w-auto text-sm"
              >
                <Smartphone className="mr-2 h-4 w-4 text-primary" />
                Customer Portal Login
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card needed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2-minute shop setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Offline PWA mobile ready
              </span>
            </div>

            {/* Interactive Product Mockup Window */}
            <div className="mt-14 max-w-5xl mx-auto">
              <div className="rounded-xl border bg-card text-card-foreground shadow-2xl overflow-hidden text-left">
                {/* Browser / App Titlebar */}
                <div className="bg-muted/70 px-4 py-3 border-b flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-amber-400 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="ml-2 font-mono font-medium text-foreground">
                      shree-ganesh-water.paaniwale.tech/dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
                      Live Route Active
                    </Badge>
                  </div>
                </div>

                {/* Subheader Toolbar */}
                <div className="p-4 sm:p-6 border-b bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        Morning Delivery Route #A (Bodakdev & Satellite)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sequenced for minimum driver travel time • Updated 3 mins ago
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg border text-xs">
                      <button
                        onClick={() => setActiveTab("routes")}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                          activeTab === "routes"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Daily Deliveries
                      </button>
                      <button
                        onClick={() => setActiveTab("invoicing")}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                          activeTab === "invoicing"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        WhatsApp Invoices
                      </button>
                      <button
                        onClick={() => setActiveTab("party")}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                          activeTab === "party"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Party Orders
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    <div className="p-3 rounded-lg border bg-background">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">
                        Jars Delivered
                      </span>
                      <p className="text-lg font-bold text-foreground mt-0.5">
                        428 <span className="text-xs text-emerald-600 font-normal">/ 450</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border bg-background">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">
                        Empty Jars Collected
                      </span>
                      <p className="text-lg font-bold text-foreground mt-0.5">
                        418 <span className="text-xs text-emerald-600 font-normal">(97.6%)</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border bg-background">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">
                        Today Collections
                      </span>
                      <p className="text-lg font-bold text-foreground mt-0.5">
                        ₹13,696 <span className="text-xs text-muted-foreground font-normal">UPI</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border bg-background">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">
                        WhatsApp Bills Sent
                      </span>
                      <p className="text-lg font-bold text-emerald-600 mt-0.5">
                        38 Dispatched
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabbed View Body */}
                <div className="p-4 sm:p-6 bg-background">
                  {activeTab === "routes" && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground font-medium">
                            <th className="pb-3 font-semibold">Seq #</th>
                            <th className="pb-3 font-semibold">Customer / Location</th>
                            <th className="pb-3 font-semibold">Bottle Rate</th>
                            <th className="pb-3 font-semibold">Today Drops</th>
                            <th className="pb-3 font-semibold">Empty Returned</th>
                            <th className="pb-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-xs sm:text-sm">
                          <tr>
                            <td className="py-3 font-mono font-semibold text-primary">#01</td>
                            <td className="py-3 font-medium">
                              Rameshwar Dairy & Sweets
                              <span className="block text-[11px] text-muted-foreground">Shop 4, Gala Arcade</span>
                            </td>
                            <td className="py-3 font-mono">₹30</td>
                            <td className="py-3 font-semibold">8 Jars</td>
                            <td className="py-3 text-emerald-600 font-semibold">8 Empty</td>
                            <td className="py-3">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                Delivered
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 font-mono font-semibold text-primary">#02</td>
                            <td className="py-3 font-medium">
                              TecoDesk Coworking Space
                              <span className="block text-[11px] text-muted-foreground">3rd Floor, Silicon Square</span>
                            </td>
                            <td className="py-3 font-mono">₹35</td>
                            <td className="py-3 font-semibold">12 Jars</td>
                            <td className="py-3 text-emerald-600 font-semibold">12 Empty</td>
                            <td className="py-3">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                Delivered
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 font-mono font-semibold text-primary">#03</td>
                            <td className="py-3 font-medium">
                              Aakash Residency (B-402)
                              <span className="block text-[11px] text-muted-foreground">B-Wing, Judges Bungalow Rd</span>
                            </td>
                            <td className="py-3 font-mono">₹30</td>
                            <td className="py-3 font-semibold">2 Jars</td>
                            <td className="py-3 text-emerald-600 font-semibold">2 Empty</td>
                            <td className="py-3">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                Delivered
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 font-mono font-semibold text-primary">#04</td>
                            <td className="py-3 font-medium">
                              Royal Fitness Gym
                              <span className="block text-[11px] text-muted-foreground">Basement, Titanium Complex</span>
                            </td>
                            <td className="py-3 font-mono">₹30</td>
                            <td className="py-3 font-semibold">6 Jars</td>
                            <td className="py-3 text-amber-600 font-semibold">5 Empty (1 Pending)</td>
                            <td className="py-3">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                1 Jar Pending
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "invoicing" && (
                    <div className="rounded-lg border bg-muted/20 p-4 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b">
                        <div>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            Automated WhatsApp Dispatch
                          </span>
                          <h4 className="text-base font-semibold text-foreground">
                            Monthly Bill - TecoDesk Coworking Space
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Delivery period: October 2026 • 240 Jars • Rate: ₹35
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Total Invoice</span>
                          <p className="text-xl font-bold text-foreground">₹8,400</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-background p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <FileText className="h-4 w-4 text-primary" />
                            Official PDF Invoice Attached
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Invoice-TecoDesk-Oct-2026.pdf (Detailed drop table with timestamps and shop verification seal)
                          </p>
                          <div className="pt-2 flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              Preview PDF
                            </Button>
                            <Button size="sm" variant="secondary" className="text-xs h-7">
                              Download Copy
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-background p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <CreditCard className="h-4 w-4 text-emerald-600" />
                            Instant UPI Payment Integration
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Embedded Razorpay & UPI intent links allow customer to tap and pay directly in GPay, PhonePe, or Paytm.
                          </p>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            Instant Auto-Reconciliation
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "party" && (
                    <div className="rounded-lg border bg-muted/20 p-4 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b">
                        <div>
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            Event & Wedding Bulk Supply
                          </span>
                          <h4 className="text-base font-semibold text-foreground">
                            Wedding Reception — Patel Party Plot
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Delivery scheduled for Saturday • Contact: Hitesh Patel (+91 98250 XXXXX)
                          </p>
                        </div>
                        <Badge className="bg-primary text-primary-foreground">
                          Order Confirmed
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg border bg-background">
                          <span className="text-xs text-muted-foreground">Chilled Bottles</span>
                          <p className="text-base font-semibold text-foreground mt-0.5">
                            80 Jars <span className="text-xs text-muted-foreground font-normal">@ ₹50</span>
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-background">
                          <span className="text-xs text-muted-foreground">Normal Room Temp</span>
                          <p className="text-base font-semibold text-foreground mt-0.5">
                            50 Jars <span className="text-xs text-muted-foreground font-normal">@ ₹30</span>
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border bg-background">
                          <span className="text-xs text-muted-foreground">Order Total</span>
                          <p className="text-base font-bold text-emerald-600 mt-0.5">
                            ₹5,500
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Value Metrics */}
        <section className="py-12 border-b bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  4.5 hrs
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Saved per week on manual diary books
                </p>
              </div>

              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  99.4%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Empty jar return reconciliation rate
                </p>
              </div>

              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  3x Faster
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Payment collection via WhatsApp bills
                </p>
              </div>

              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  100%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Offline mobile PWA field accessibility
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Solution Pillars (Bento Grid) */}
        <section id="features" className="py-20 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider font-semibold text-primary">
                Engineered for Water Distributors
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                Everything your water delivery business needs, in one system
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-3">
                Built specifically for Indian water bottle delivery routes, party catering orders, and recurring monthly household accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="border hover:border-primary/50 transition-all duration-200">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Truck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Sequenced Delivery Routes</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Assign sequence numbers (#1 to #100) to every customer. Your delivery boys follow a predetermined line, saving fuel and cutting delivery time by up to 35%.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  • Route sorting by street or building
                  <br />• Multi-vehicle route partitioning
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border hover:border-primary/50 transition-all duration-200">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
                    <Package className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Dual Jar Ledger & Return Tracking</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Never lose an empty 20L bottle again. Track both bottles delivered and empty cans received at every single doorstep in real time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  • Real-time empty can balance per client
                  <br />• Protects ₹150+ deposit value per jar
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border hover:border-primary/50 transition-all duration-200">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 mb-3">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">1-Click WhatsApp Invoicing</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Generate professional PDF invoices with shop branding and bank QR code. Dispatches instantly to customer WhatsApp with delivery breakdown.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  • Bulk send to all monthly accounts
                  <br />• Official PDF receipt attachment
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border hover:border-primary/50 transition-all duration-200">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 mb-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Party & Event Bulk Orders</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Dedicated module for marriages, conferences, and festivals with dual pricing for chilled cold bottles vs normal room-temperature bottles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  • Separate cold & normal jar rates
                  <br />• Custom event delivery notes & schedule
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="border hover:border-primary/50 transition-all duration-200">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 mb-3">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Customer Self-Service Portal</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Give your customers a dedicated portal to view their delivery calendar, verified drops, empty bottle tally, and pay bills anytime via WhatsApp OTP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  • Eliminates customer billing disputes
                  <br />• Transparent daily drop ledger
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="border hover:border-primary/50 transition-all duration-200">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 mb-3">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Offline PWA & Enterprise Security</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Works offline on any Android or iOS device. Automatically syncs when internet returns. Complete data isolation with encrypted authentication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  • Zero data loss in basements or offline zones
                  <br />• Multi-tenant isolated database
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive ROI Calculator */}
        <section id="calculator" className="py-20 border-b bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <Badge variant="outline" className="mb-2 text-xs font-semibold text-primary uppercase">
                Return On Investment
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Calculate your monthly time & revenue savings
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                See how much paperwork time and unreturned empty bottle losses PaaniWale prevents for your agency.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-foreground">
                    Daily Water Jar Delivery Volume:
                  </label>
                  <span className="font-mono text-xl font-bold text-primary px-3 py-1 bg-primary/10 rounded-md">
                    {dailyBottles} Jars / Day
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={dailyBottles}
                  onChange={(e) => setDailyBottles(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                  <span>50 Jars (Small Vendor)</span>
                  <span>500 Jars (Medium Agency)</span>
                  <span>1,500+ Jars (Enterprise Distributor)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-6">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    Paperwork Hours Saved
                  </span>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {roiCalculations.hoursSavedPerMonth} Hours / mo
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    No ledger entries, instant month-end bills
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    Empty Jars Saved from Loss
                  </span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    ₹{roiCalculations.jarLossSavings.toLocaleString("en-IN")} / mo
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    ~{roiCalculations.unreturnedJarsSaved} bottles tracked & collected
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    Monthly Delivery Volume
                  </span>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {roiCalculations.monthlyBottles.toLocaleString("en-IN")} Jars
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Reconciled with 100% route accuracy
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ready to modernize your water delivery operations?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Set up your shop in 2 minutes. Free trial with complete feature access.
                  </p>
                </div>
                <Button onClick={() => navigate("/signupdp")} className="font-semibold text-xs sm:text-sm">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Distributor Testimonials */}
        <section className="py-20 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="outline" className="mb-2 text-xs font-semibold text-primary uppercase">
                Verified Distributors
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Trusted by water agencies across Gujarat & India
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border">
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground italic leading-relaxed">
                    &quot;Earlier, we used to spend 4 days at every month-end writing paper receipts and calling customers. With PaaniWale, we send 200 WhatsApp bills in 2 minutes and collect 80% payments on day 1.&quot;
                  </p>
                  <div className="mt-5 pt-4 border-t flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                      RP
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Ramesh Patel</p>
                      <p className="text-[11px] text-muted-foreground">Shree Krishna Water Supply, Ahmedabad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground italic leading-relaxed">
                    &quot;Our biggest headache was lost empty jars. Customers would claim they gave 5 bottles, and we had no record. The dual drop and empty return ledger completely stopped this leak.&quot;
                  </p>
                  <div className="mt-5 pt-4 border-t flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600 text-xs">
                      MS
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Mahesh Solanki</p>
                      <p className="text-[11px] text-muted-foreground">Shreeji Aqua Distributors, Surat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground italic leading-relaxed">
                    &quot;The customer portal is brilliant. Corporate offices and cafes just log in and check their daily delivery entries themselves. No arguments, no diary disputes.&quot;
                  </p>
                  <div className="mt-5 pt-4 border-t flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-600 text-xs">
                      DP
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Dharmesh Prajapati</p>
                      <p className="text-[11px] text-muted-foreground">Royal Water Solutions, Rajkot</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section id="faq" className="py-20 border-b bg-muted/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-2 text-xs font-semibold text-primary uppercase">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Got questions? We have answers.
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = faqOpenIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-lg border bg-card overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setFaqOpenIndex(isOpen ? -1 : index)}
                      className="w-full px-5 py-4 text-left font-semibold text-sm flex items-center justify-between text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-3 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t pt-3 bg-muted/10">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact & Inquiry Section */}
        <section id="contact" className="py-20 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <Badge variant="outline" className="mb-2 text-xs font-semibold text-primary uppercase">
                  Get In Touch
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Ready to upgrade your delivery business?
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Have questions about pricing, bulk migration from paper ledgers, or custom distributor requirements? Contact our team or fill in the inquiry form.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Call & WhatsApp Support</p>
                      <p className="text-sm font-semibold text-foreground">+91 94273 00000 / Support Line</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email Inquiries</p>
                      <p className="text-sm font-semibold text-foreground">support@paaniwale.tech</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Headquarters</p>
                      <p className="text-sm font-semibold text-foreground">Ahmedabad, Gujarat, India</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-lg border bg-muted/30">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Rapid Onboarding
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Our team provides 1-on-1 assistance to import your current customer names and routes in under 10 minutes.
                  </p>
                </div>
              </div>

              {/* Inquiry Card */}
              <Card className="border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Submit an Inquiry</CardTitle>
                  <CardDescription className="text-xs">
                    Fill in your details below and we will contact you right away.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InquiryForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-muted/40 text-muted-foreground text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img src={paaniwaleLogo} alt="PaaniWale" className="h-6 w-6" />
                  <span className="font-bold text-foreground text-sm">PaaniWale CRM</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The complete business operating system for water bottle distributors and route delivery vendors.
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-foreground text-xs uppercase mb-3">Product</h5>
                <ul className="space-y-2">
                  <li><a href="#features" className="hover:text-foreground">Route Sequencing</a></li>
                  <li><a href="#features" className="hover:text-foreground">Empty Bottle Ledger</a></li>
                  <li><a href="#features" className="hover:text-foreground">WhatsApp Invoicing</a></li>
                  <li><a href="#features" className="hover:text-foreground">Party Orders</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-foreground text-xs uppercase mb-3">Access</h5>
                <ul className="space-y-2">
                  <li><button onClick={() => navigate("/customerportal/login")} className="hover:text-foreground">Customer Portal</button></li>
                  <li><button onClick={() => navigate("/signin")} className="hover:text-foreground">Distributor Login</button></li>
                  <li><button onClick={() => navigate("/signupdp")} className="hover:text-foreground">Create New Shop</button></li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-foreground text-xs uppercase mb-3">Support</h5>
                <ul className="space-y-2">
                  <li><a href="#faq" className="hover:text-foreground">FAQ & Docs</a></li>
                  <li><a href="#contact" className="hover:text-foreground">Contact Sales</a></li>
                  <li><span className="text-foreground">support@paaniwale.tech</span></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} PaaniWale Technologies. All rights reserved.</p>
              <div className="flex gap-4">
                <span>Made for Indian Water Distributors</span>
                <span>•</span>
                <span>ISO & Encrypted Data Standards</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
