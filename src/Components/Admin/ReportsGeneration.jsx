import { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Label } from "@/Components/UI/shadcn-UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { Calendar } from "@/Components/UI/shadcn-UI/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/UI/shadcn-UI/popover";
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  CreditCard,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  Mail,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function ReportsGeneration() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("customers");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    {
      id: "revenue",
      name: "Revenue Report",
      description: "Revenue analysis with time-based breakdown",
      icon: TrendingUp,
      color: "blue",
      endpoint: "/revenue",
    },
    {
      id: "users",
      name: "User Activity Report",
      description: "User engagement and activity statistics",
      icon: Users,
      color: "green",
      endpoint: "/users",
    },
    {
      id: "customers",
      name: "Customer Report",
      description: "Customer demographics and behavior analysis",
      icon: ShoppingCart,
      color: "purple",
      endpoint: "/customers",
    },
    {
      id: "payments",
      name: "Payment Report",
      description: "Payment transactions and financial summary",
      icon: CreditCard,
      color: "orange",
      endpoint: "/payments",
    },
    {
      id: "inventory",
      name: "Inventory Report",
      description: "Bottle delivery tracking and inventory movement",
      icon: BarChart3,
      color: "red",
      endpoint: "/inventory",
    },
    {
      id: "comprehensive",
      name: "Comprehensive Report",
      description: "Complete business overview with all metrics",
      icon: FileText,
      color: "indigo",
      endpoint: "/comprehensive",
    },
  ];

  const getDateRangeValues = () => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        start = subDays(new Date(now.setHours(0, 0, 0, 0)), 1);
        end = subDays(new Date(now.setHours(23, 59, 59, 999)), 1);
        break;
      case "last-7-days":
        start = subDays(new Date(), 7);
        end = new Date();
        break;
      case "last-30-days":
        start = subDays(new Date(), 30);
        end = new Date();
        break;
      case "this-month":
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case "last-month": {
        const lastMonth = subDays(startOfMonth(new Date()), 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      }
      case "this-quarter":
        start = startOfQuarter(new Date());
        end = endOfQuarter(new Date());
        break;
      case "this-year":
        start = startOfYear(new Date());
        end = endOfYear(new Date());
        break;
      case "custom":
        start = startDate;
        end = endDate;
        break;
      default:
        start = subDays(new Date(), 30);
        end = new Date();
    }

    return { start, end };
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setReportData(null);

      const { start, end } = getDateRangeValues();

      if (dateRange === "custom" && (!start || !end)) {
        toast({
          title: "Error",
          description:
            "Please select both start and end dates for custom range",
          variant: "destructive",
        });
        return;
      }

      const selectedReport = reportTypes.find((r) => r.id === reportType);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/reports${selectedReport.endpoint}`,
        {
          startDate: start?.toISOString(),
          endDate: end?.toISOString(),
          groupBy: reportType === "revenue" ? "month" : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReportData(response.data.data);

        toast({
          title: "Success",
          description: `${selectedReport.name} generated successfully. Click the download button to export.`,
        });
      }
    } catch (error) {
      console.error("Generate report error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) {
      toast({
        title: "Error",
        description: "Please generate a report first",
        variant: "destructive",
      });
      return;
    }

    // Export based on format
    if (exportFormat === "csv") {
      exportToCSV(reportData);
    } else if (exportFormat === "pdf") {
      exportToPDF(reportData);
    } else {
      exportToExcel(reportData);
    }
  };

  const exportToCSV = (data) => {
    let csvContent = "";
    let fileName = `${reportType}_report_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;

    // Generate CSV based on report type
    switch (reportType) {
      case "customers":
        csvContent =
          "Customer Name,Phone,Email,Status,Total Entries,Total Bottles,Total Revenue,Created At\n";
        data.customers?.forEach((customer) => {
          csvContent += `"${customer.cname || ""}","${
            customer.cphone_number || ""
          }","${customer.email || ""}","${customer.status || ""}",${
            customer.totalEntries || 0
          },${customer.totalBottles || 0},${customer.totalRevenue || 0},"${
            customer.createdAt
              ? format(new Date(customer.createdAt), "PPP")
              : ""
          }"\n`;
        });
        break;

      case "payments":
        csvContent =
          "Customer,Phone,Amount,Status,Method,Transaction ID,Date\n";
        data.payments?.forEach((payment) => {
          csvContent += `"${payment.cid?.cname || ""}","${
            payment.cid?.cphone_number || ""
          }",${payment.amount || 0},"${payment.payment_status || ""}","${
            payment.payment_method || ""
          }","${payment.transaction_id || ""}","${
            payment.createdAt ? format(new Date(payment.createdAt), "PPP") : ""
          }"\n`;
        });
        break;

      case "revenue":
        csvContent =
          "Period,Total Revenue,Total Bottles,Total Orders,Average Order Value\n";
        data.revenueData?.forEach((period) => {
          csvContent += `"${period.period}",${period.totalRevenue || 0},${
            period.totalBottles || 0
          },${period.totalOrders || 0},${(
            (period.totalRevenue || 0) / (period.totalOrders || 1)
          ).toFixed(2)}\n`;
        });
        break;

      case "inventory":
        csvContent = "Customer,Total Bottles,Total Revenue,Delivery Count\n";
        data.inventoryByCustomer?.forEach((item) => {
          csvContent += `"${item.customer?.cname || "Unknown"}",${
            item.totalBottles || 0
          },${item.totalRevenue || 0},${item.deliveryCount || 0}\n`;
        });
        break;

      case "users":
        csvContent =
          "Name,Phone,Email,Status,Role,Total Customers,Total Deliveries,Total Payments,Created At\n";
        data.users?.forEach((user) => {
          csvContent += `"${user.fname || ""} ${user.lname || ""}","${
            user.phone_number || ""
          }","${user.email || ""}","${user.status || ""}","${
            user.is_admin ? "Admin" : "User"
          }",${user.stats?.totalCustomers || 0},${
            user.stats?.totalDeliveries || 0
          },${user.stats?.totalPayments || 0},"${
            user.createdAt ? format(new Date(user.createdAt), "PPP") : ""
          }"\n`;
        });
        break;

      case "comprehensive":
        csvContent = "Metric,Value\n";
        csvContent += `Total Customers,${data.overview?.totalCustomers || 0}\n`;
        csvContent += `Total Users,${data.overview?.totalUsers || 0}\n`;
        csvContent += `Total Deliveries,${
          data.overview?.totalDeliveries || 0
        }\n`;
        csvContent += `Total Bottles,${data.overview?.totalBottles || 0}\n`;
        csvContent += `Total Revenue,${data.overview?.totalRevenue || 0}\n`;
        csvContent += `Total Payments,${data.overview?.totalPayments || 0}\n`;
        csvContent += `Total Payment Amount,${
          data.overview?.totalPaymentAmount || 0
        }\n`;
        break;
    }

    // Create and download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data) => {
    // For Excel export, convert to CSV format (simple approach)
    // For true Excel format, you would use a library like xlsx
    exportToCSV(data);
    toast({
      title: "Info",
      description:
        "Excel format exported as CSV. Install 'xlsx' library for true Excel format.",
    });
  };

  const exportToPDF = (data) => {
    const selectedReport = reportTypes.find((r) => r.id === reportType);
    const fileName = `${reportType}_report_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.pdf`;

    // Create a simple text-based PDF content
    let pdfContent = `${selectedReport.name}\n`;
    pdfContent += `Generated: ${format(new Date(), "PPP p")}\n\n`;

    // Add summary
    if (data.summary) {
      pdfContent += "SUMMARY\n";
      pdfContent += "=======\n";
      Object.entries(data.summary).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, " $1").trim();
        const formattedValue =
          typeof value === "number" &&
          (key.toLowerCase().includes("amount") ||
            key.toLowerCase().includes("revenue"))
            ? `₹${value.toLocaleString()}`
            : value;
        pdfContent += `${label}: ${formattedValue}\n`;
      });
    }

    if (data.overview) {
      pdfContent += "\nOVERVIEW\n";
      pdfContent += "========\n";
      Object.entries(data.overview).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, " $1").trim();
        const formattedValue =
          typeof value === "number" &&
          (key.toLowerCase().includes("amount") ||
            key.toLowerCase().includes("revenue"))
            ? `₹${value.toLocaleString()}`
            : value;
        pdfContent += `${label}: ${formattedValue}\n`;
      });
    }

    // For now, save as text file (for real PDF, use jspdf library)
    const blob = new Blob([pdfContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName.replace(".pdf", ".txt"));
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Info",
      description:
        "PDF exported as text file. Install 'jspdf' library for true PDF format.",
    });
  };

  const handleEmailReport = async () => {
    if (!reportData) {
      toast({
        title: "Error",
        description: "Please generate a report first",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);

      const selectedReport = reportTypes.find((r) => r.id === reportType);
      const token = localStorage.getItem("token");
      const { start, end } = getDateRangeValues();

      // Call backend API to send email
      const response = await axios.post(
        `${API_URL}/api/reports/email`,
        {
          reportType: reportType,
          reportName: selectedReport.name,
          startDate: start?.toISOString(),
          endDate: end?.toISOString(),
          format: exportFormat,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Report sent to your email successfully",
        });
      }
    } catch (error) {
      console.error("Email report error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send report email",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleScheduleReport = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type first",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedReport = reportTypes.find((r) => r.id === reportType);
      const token = localStorage.getItem("token");

      // Call backend API to schedule report
      const response = await axios.post(
        `${API_URL}/api/reports/schedule`,
        {
          reportType: reportType,
          reportName: selectedReport.name,
          dateRange: dateRange,
          format: exportFormat,
          frequency: "weekly", // Default frequency
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Report scheduled successfully",
        });
      }
    } catch (error) {
      console.error("Schedule report error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to schedule report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate comprehensive reports and export data
        </p>
      </div>

      {/* Report Type Selection */}
      <div>
        <Label className="text-base mb-4 block">Select Report Type</Label>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  reportType === type.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setReportType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-${type.color}-100`}>
                      <Icon className={`h-6 w-6 text-${type.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                      {reportType === type.id && (
                        <Badge className="mt-2">Selected</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Configure report parameters and format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      CSV Spreadsheet
                    </div>
                  </SelectItem>
                  <SelectItem value="xlsx">
                    <div className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel (XLSX)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === "custom" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={generating}
              className="flex-1 md:flex-none"
            >
              {generating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>

            {reportData && (
              <Button
                variant="outline"
                onClick={handleDownloadReport}
                className="flex-1 md:flex-none"
              >
                <Download className="mr-2 h-4 w-4" />
                Download {exportFormat.toUpperCase()}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleEmailReport}
              disabled={generating || !reportData}
              className="flex-1 md:flex-none"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Report
            </Button>
            <Button
              variant="outline"
              onClick={handleScheduleReport}
              className="flex-1 md:flex-none"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary - Show after generation */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Report Generated Successfully
            </CardTitle>
            <CardDescription>
              Generated on{" "}
              {reportData.generatedAt
                ? format(new Date(reportData.generatedAt), "PPP p")
                : "just now"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              {reportData.summary && (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {(typeof value === "number" &&
                          key.toLowerCase().includes("amount")) ||
                        key.toLowerCase().includes("revenue")
                          ? `₹${value.toLocaleString()}`
                          : typeof value === "number"
                          ? value.toLocaleString()
                          : value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Overview for comprehensive report */}
              {reportData.overview && (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(reportData.overview).map(([key, value]) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {typeof value === "number" &&
                        (key.toLowerCase().includes("amount") ||
                          key.toLowerCase().includes("revenue"))
                          ? `₹${value.toLocaleString()}`
                          : typeof value === "number"
                          ? value.toLocaleString()
                          : value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Report data has been exported to {exportFormat.toUpperCase()}{" "}
                format.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Sales Report - November 2024",
                type: "PDF",
                date: "2024-11-15",
                size: "2.3 MB",
              },
              {
                name: "User Activity - Q3 2024",
                type: "Excel",
                date: "2024-10-01",
                size: "1.8 MB",
              },
              {
                name: "Payment Report - October 2024",
                type: "CSV",
                date: "2024-10-31",
                size: "856 KB",
              },
              {
                name: "Comprehensive Report - 2024",
                type: "PDF",
                date: "2024-01-01",
                size: "5.4 MB",
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-blue-100">
                    {report.type === "PDF" ? (
                      <FileText className="h-5 w-5 text-blue-600" />
                    ) : (
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(report.date).toLocaleDateString()} •{" "}
                      {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>
            Automated report generation schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Weekly Sales Summary",
                frequency: "Every Monday",
                format: "PDF",
              },
              {
                name: "Monthly Analytics",
                frequency: "1st of each month",
                format: "Excel",
              },
              {
                name: "Daily Payment Report",
                frequency: "Every day at 9:00 AM",
                format: "CSV",
              },
            ].map((schedule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{schedule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.frequency} • {schedule.format}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
