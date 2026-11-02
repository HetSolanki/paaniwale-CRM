import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import {
  LogOut,
  User,
  Phone,
  MapPin,
  IndianRupee,
  Calendar,
  Package,
  ShieldCheck,
  Download,
  Search,
  MessageCircle,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { config } from "@/Data/config";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/UI/shadcn-UI/table";
import Skeleton from "react-loading-skeleton";
import paaniwaleLogo from "@/assets/paniwalalogo.png";
import { jsPDF } from "jspdf";

export default function CustomerDashboard() {
  const [customerData, setCustomerData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      navigate("/customerportal/login");
      return;
    }

    fetchCustomerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(
        `${config.baseUrl}/api/customerportal/portal/dashboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setCustomerData(data.customer);
        setEntries(data.entries || []);
      } else {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: data.message || "Please log in again.",
        });

        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to fetch account records. Please retry.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerPhone");
    navigate("/customerportal/login");
  };

  // Calculations
  const stats = useMemo(() => {
    const deliveredEntries = entries.filter(
      (e) => e.delivery_status === "Delivered"
    );
    const absentEntries = entries.filter((e) => e.delivery_status === "Absent");

    const totalBottles = deliveredEntries.reduce(
      (sum, entry) => sum + (entry.bottle_count || 0),
      0
    );

    const bottlePrice = customerData?.bottle_price || 0;
    const totalAmount = totalBottles * bottlePrice;

    return {
      totalBottles,
      totalAmount,
      deliveredDays: deliveredEntries.length,
      absentDays: absentEntries.length,
      totalDays: entries.length,
      bottlePrice,
    };
  }, [entries, customerData]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" ||
        entry.delivery_status?.toLowerCase() === statusFilter.toLowerCase();

      const formattedDate = entry.delivery_date
        ? format(new Date(entry.delivery_date), "dd MMM yyyy").toLowerCase()
        : "";

      const matchesSearch =
        !searchQuery || formattedDate.includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [entries, statusFilter, searchQuery]);

  // Download statement
  const handleDownloadStatement = () => {
    if (!customerData) return;

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Header
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 35, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Customer Delivery Statement", 15, 16);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("PaaniWale Customer Portal • Generated Online", 15, 24);

      // Customer Details
      pdf.setTextColor(0, 0, 0);
      let yPos = 48;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Customer Name:", 15, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(customerData.cname || "N/A", 55, yPos);

      yPos += 7;
      pdf.setFont("helvetica", "bold");
      pdf.text("Phone Number:", 15, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(customerData.cphone_number || "N/A", 55, yPos);

      yPos += 7;
      pdf.setFont("helvetica", "bold");
      pdf.text("Delivery Address:", 15, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(customerData.caddress || "N/A", 55, yPos);

      yPos += 7;
      pdf.setFont("helvetica", "bold");
      pdf.text("Bottle Rate:", 15, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Rs. ${customerData.bottle_price || 0} per 20L Jar`, 55, yPos);

      // Summary Box
      yPos += 14;
      pdf.setDrawColor(220, 220, 220);
      pdf.setFillColor(248, 250, 252);
      pdf.rect(15, yPos, pageWidth - 30, 20, "FD");

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Total Delivered Bottles:", 20, yPos + 8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${stats.totalBottles} Jars`, 70, yPos + 8);

      pdf.setFont("helvetica", "bold");
      pdf.text("Current Total Amount:", 20, yPos + 15);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(22, 163, 74);
      pdf.text(`Rs. ${stats.totalAmount}`, 70, yPos + 15);
      pdf.setTextColor(0, 0, 0);

      // Entries Table
      yPos += 28;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(15, yPos, pageWidth - 30, 8, "F");

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text("#", 18, yPos + 5.5);
      pdf.text("DATE", 35, yPos + 5.5);
      pdf.text("BOTTLES", 90, yPos + 5.5);
      pdf.text("STATUS", 130, yPos + 5.5);
      pdf.text("AMOUNT", pageWidth - 35, yPos + 5.5);

      pdf.setTextColor(0, 0, 0);
      yPos += 8;

      entries.slice(0, 30).forEach((entry, idx) => {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(String(idx + 1), 18, yPos + 5);
        pdf.text(
          entry.delivery_date
            ? format(new Date(entry.delivery_date), "dd MMM yyyy")
            : "N/A",
          35,
          yPos + 5
        );
        pdf.text(`${entry.bottle_count || 0} Jars`, 90, yPos + 5);
        pdf.text(entry.delivery_status || "Delivered", 130, yPos + 5);
        pdf.text(
          `Rs. ${(entry.bottle_count || 0) * (customerData.bottle_price || 0)}`,
          pageWidth - 35,
          yPos + 5
        );

        yPos += 7;
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
      });

      const fileName = `Statement-${(customerData.cname || "Customer").replace(
        /\s+/g,
        "-"
      )}-${format(new Date(), "MMM-yyyy")}.pdf`;

      pdf.save(fileName);
      toast({
        title: "Downloaded",
        description: "Your delivery statement has been saved as PDF",
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate PDF statement.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton width={180} height={36} />
            <Skeleton width={90} height={36} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton height={90} />
            <Skeleton height={90} />
            <Skeleton height={90} />
            <Skeleton height={90} />
          </div>
          <Skeleton height={140} />
          <Skeleton height={320} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={paaniwaleLogo} alt="PaaniWale" className="h-8 w-8" />
            <div>
              <span className="font-bold text-base tracking-tight flex items-center gap-1.5">
                PaaniWale
                <Badge variant="outline" className="text-[10px] py-0 bg-primary/10 text-primary border-primary/20">
                  Customer Portal
                </Badge>
              </span>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Daily Delivery Transparency & Bills
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold capitalize text-foreground">
                {customerData?.cname || "Customer"}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                +91 {customerData?.cphone_number}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Welcome Header & Action Banner */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground capitalize">
                Hello, {customerData?.cname || "Customer"}!
              </h1>
              <Badge variant="secondary" className="text-xs font-semibold">
                Seq #{customerData?.delivery_sequence_number || "01"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review your monthly water jar deliveries, verify drop history, and download official bills.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              onClick={handleDownloadStatement}
              variant="outline"
              size="sm"
              className="text-xs font-medium flex-1 md:flex-none"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download Statement
            </Button>

            <a
              href={`https://wa.me/?text=Hello%20Paaniwale%20distributor,%20I%20am%20${encodeURIComponent(
                customerData?.cname || "Customer"
              )}%20(Phone:%20${customerData?.cphone_number}).%20Regarding%20my%20water%20delivery...`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none"
            >
              <Button
                size="sm"
                className="w-full text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                Contact Vendor
              </Button>
            </a>
          </div>
        </div>

        {/* Financial & Delivery Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Delivered Jars
                </span>
                <Package className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stats.totalBottles} <span className="text-xs font-normal text-muted-foreground">Jars</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Current billing cycle
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Current Bill Total
                </span>
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-emerald-600">
                ₹{stats.totalAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                @ ₹{stats.bottlePrice} / 20L bottle
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Delivery Days
                </span>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stats.deliveredDays} <span className="text-xs font-normal text-muted-foreground">Days</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {stats.absentDays > 0 ? `${stats.absentDays} marked absent` : "Zero absent days"}
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Bottle Rate
                </span>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                ₹{stats.bottlePrice}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Per 20-Litre Mineral Jar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Account Information Details */}
        <Card className="border shadow-sm">
          <CardHeader className="py-3.5 px-4 sm:px-6 border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Account & Delivery Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Customer Name</span>
              <span className="font-semibold text-foreground text-sm capitalize">
                {customerData?.cname || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block mb-0.5">Registered Phone</span>
              <span className="font-semibold text-foreground text-sm font-mono">
                +91 {customerData?.cphone_number || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block mb-0.5">Delivery Address</span>
              <span className="font-semibold text-foreground text-sm block">
                {customerData?.caddress || "N/A"}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block mb-0.5">Verification Status</span>
              <Badge
                variant="outline"
                className={`mt-0.5 text-[11px] ${
                  customerData?.phone_verification_status
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                }`}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active Account
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Delivery History Ledger */}
        <Card className="border shadow-sm">
          <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Daily Delivery Ledger
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Transparent log of bottles delivered and verified by your distributor
              </CardDescription>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border bg-background border-input focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-md border bg-background border-input focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredEntries.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Package className="h-10 w-10 mx-auto text-muted-foreground/60" />
                <p className="text-sm font-medium">No delivery entries match your criteria</p>
                <p className="text-xs">Entries will appear here as daily deliveries are logged.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <tr className="border-b bg-muted/30 text-xs text-muted-foreground font-semibold">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Bottles Received</TableHead>
                      <TableHead>Bottle Rate</TableHead>
                      <TableHead>Delivery Status</TableHead>
                      <TableHead className="text-right">Line Amount</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody className="text-xs divide-y">
                    {filteredEntries.map((entry, index) => {
                      const isDelivered = entry.delivery_status === "Delivered";
                      const lineAmount =
                        (entry.bottle_count || 0) * (customerData?.bottle_price || 0);

                      return (
                        <TableRow key={entry._id || index} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="text-center font-mono font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {entry.delivery_date
                              ? format(new Date(entry.delivery_date), "EEE, dd MMM yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Package className="h-3.5 w-3.5 text-primary" />
                              {entry.bottle_count || 0} Jars
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            ₹{customerData?.bottle_price || 0}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-medium ${
                                isDelivered
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
                              }`}
                            >
                              {isDelivered ? (
                                <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600 inline" />
                              ) : (
                                <XCircle className="mr-1 h-3 w-3 text-red-600 inline" />
                              )}
                              {entry.delivery_status || "Delivered"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-foreground">
                            ₹{lineAmount}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t mt-12 bg-background text-center text-xs text-muted-foreground">
        <p>PaaniWale Customer Transparency Portal • Verified Water Delivery Service</p>
      </footer>
    </div>
  );
}
