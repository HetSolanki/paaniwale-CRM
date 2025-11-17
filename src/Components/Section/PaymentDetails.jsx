import { DataTable } from "@/Components/DataTables/PaymentDetailDatatable";
import { columns } from "@/ColumnsSchema/PaymentDetailsColumns";
import Navbar from "./Navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/Components/UI/shadcn-UI/card";
import { Button } from "../UI/shadcn-UI/button";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  DollarSign,
  CheckCircle2,
  Clock,
  Package,
  TrendingUp,
  Wallet,
  CreditCard,
  Banknote,
  Building2,
  MoreHorizontal,
  Calendar,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { useQuery } from "@tanstack/react-query";
import { config } from "@/Data/config";
import { fetchpaymentdata } from "@/Handlers/fetchPaymentData";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/UI/shadcn-UI/popover";

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Month filter state - default to last month
  const [monthFilter, setMonthFilter] = useState("last_month");
  const [customMonth, setCustomMonth] = useState(null);
  const [customYear, setCustomYear] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["paymentdetails"],
    queryFn: fetchpaymentdata,
    enabled: !!localStorage.getItem("token"),
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });

  // Fetch all payment entries (both received and pending) with month filter
  const {
    data: allPaymentsData,
    isLoading: isLoadingPayments,
    refetch,
  } = useQuery({
    queryKey: ["allPayments", monthFilter, customMonth, customYear],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      let url = `${config.baseUrl}/api/paymentdetails/getAllPaymentEntrys`;

      // Add month filter parameters
      if (monthFilter === "this_month") {
        url += "?filter=this_month";
      } else if (monthFilter === "last_month") {
        url += "?filter=last_month";
      } else if (
        monthFilter === "custom" &&
        customMonth !== null &&
        customYear !== null
      ) {
        url += `?month=${customMonth}&year=${customYear}`;
      } else if (monthFilter === "all") {
        url += "?filter=all";
      }

      console.log("🔍 Fetching payments with URL:", url);
      console.log("📊 Filter state:", { monthFilter, customMonth, customYear });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          authorization: "Bearer " + token,
        },
      });
      const res = await response.json();
      console.log(`✅ Received ${res.data?.length || 0} payments from API`);
      if (res.status === "success") {
        return res.data;
      }
      return [];
    },
    enabled: !!localStorage.getItem("token"),
    staleTime: 0, // Set to 0 to always fetch fresh data when filter changes
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  // Transform pending payment data
  const pendingPaymentsData =
    data?.map((customer, index) => ({
      _id: customer?.cid,
      id: index + 1,
      cname: customer?.customer?.cname,
      cphone_number: customer?.customer?.cphone_number,
      caddress: customer?.customer?.caddress,
      totalamount: customer?.totalBottle * customer?.customer?.bottle_price,
      totalBottle: customer?.totalBottle,
      bottle_price: customer?.customer?.bottle_price,
      paymentStatus: "Pending",
    })) || [];

  // Transform received payment data
  const receivedPaymentsData =
    allPaymentsData
      ?.filter((payment) => {
        const isReceived =
          payment.payment_status === "Received" ||
          payment.payment_status === "completed";
        return isReceived;
      })
      .map((payment, index) => {
        return {
          _id: payment._id,
          id: index + 1,
          cname: payment.cid?.cname || payment.customer_id?.cname || "N/A",
          cphone_number:
            payment.cid?.cphone_number ||
            payment.customer_id?.cphone_number ||
            "N/A",
          caddress:
            payment.cid?.caddress || payment.customer_id?.caddress || "N/A",
          amount: payment.amount,
          payment_date: payment.payment_date,
          payment_method: payment.payment_method || "cash",
          payment_status: payment.payment_status,
        };
      }) || [];

  // Calculate stats
  const stats = {
    pending: pendingPaymentsData.length,
    completed: receivedPaymentsData.length,
    totalAmount: pendingPaymentsData.reduce(
      (sum, item) => sum + (item.totalamount || 0),
      0
    ),
    totalReceived: receivedPaymentsData.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    ),
  };

  const handleNavigate = async () => {
    try {
      // Fetch all payments without any filter for the "View All" page
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.baseUrl}/api/paymentdetails/getAllPaymentEntrys?filter=all`,
        {
          method: "GET",
          headers: {
            authorization: "Bearer " + token,
          },
        }
      );
      const res = await response.json();

      if (res.status === "success" && res.data && res.data.length > 0) {
        navigate("/paymentsdata", { state: res.data });
      } else {
        alert("No Data Found");
      }
    } catch (error) {
      console.error("Error fetching all payments:", error);
      alert("Error loading data");
    }
  };

  const getMonthYearText = () => {
    if (monthFilter === "this_month") {
      const now = new Date();
      return format(now, "MMMM yyyy");
    } else if (monthFilter === "last_month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return format(lastMonth, "MMMM yyyy");
    } else if (
      monthFilter === "custom" &&
      customMonth !== null &&
      customYear !== null
    ) {
      return format(new Date(customYear, customMonth, 1), "MMMM yyyy");
    }
    return "All Time";
  };

  return (
    <>
      <SkeletonTheme
        baseColor={`${theme === "dark" ? "#1c1c1c" : ""}`}
        highlightColor={`${theme === "dark" ? "#525252" : ""}`}
      >
        <div className="min-h-screen bg-background">
          <Navbar />

          {/* Mobile-Optimized Container */}
          <div className="pb-6 sm:pb-8">
            {/* Header Section - Mobile Optimized */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Payment Details
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleNavigate}
                    className="h-9 px-3 sm:px-4 gap-1.5"
                  >
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">All</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Month Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={monthFilter}
                    onValueChange={(value) => {
                      setMonthFilter(value);
                      if (value !== "custom") {
                        setCustomMonth(null);
                        setCustomYear(null);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-8">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="custom">Custom Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>

                  {monthFilter === "custom" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {customMonth !== null && customYear !== null
                            ? format(
                                new Date(customYear, customMonth, 1),
                                "MMM yyyy"
                              )
                            : "Select month"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="start">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Month
                            </label>
                            <Select
                              value={
                                customMonth !== null
                                  ? customMonth.toString()
                                  : ""
                              }
                              onValueChange={(value) =>
                                setCustomMonth(parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {format(new Date(2024, i, 1), "MMMM")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Year
                            </label>
                            <Select
                              value={
                                customYear !== null ? customYear.toString() : ""
                              }
                              onValueChange={(value) =>
                                setCustomYear(parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 5 }, (_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return (
                                    <SelectItem
                                      key={year}
                                      value={year.toString()}
                                    >
                                      {year}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  <Badge variant="outline" className="h-6 px-2 text-xs">
                    {getMonthYearText()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Cards - Mobile Grid */}
            <div className="px-4 pt-4 sm:px-6 sm:pt-6">
              {/* Loading Indicator */}
              {(isLoading || isLoadingPayments) && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Loading payment data...
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
                {/* Pending Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Pending
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                          {isLoading ? <Skeleton width={40} /> : stats.pending}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Completed Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">Done</p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-green-600">
                          {isLoadingPayments ? (
                            <Skeleton width={40} />
                          ) : (
                            stats.completed
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Amount Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Pending
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">
                          {isLoading ? (
                            <Skeleton width={60} />
                          ) : (
                            `₹${stats.totalAmount.toLocaleString()}`
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Received Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Received
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-green-600">
                          {isLoadingPayments ? (
                            <Skeleton width={60} />
                          ) : (
                            `₹${stats.totalReceived.toLocaleString()}`
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Payments Section - Mobile Optimized */}
              {isLoading ? (
                <Card className="mb-4 sm:mb-6 overflow-hidden">
                  <CardContent className="p-4">
                    <Skeleton className="h-[300px]" enableAnimation={true} />
                  </CardContent>
                </Card>
              ) : pendingPaymentsData.length > 0 ? (
                <Card className="mb-4 sm:mb-6 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-500 flex items-center justify-center">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg font-semibold">
                            Pending Payments
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-0.5">
                            Awaiting payment collection
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="h-6 px-2 text-xs font-semibold"
                      >
                        {pendingPaymentsData.length}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="p-6">
                      <DataTable data={pendingPaymentsData} columns={columns} />
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Received Payments Section - Mobile Optimized */}
              {isLoadingPayments ? (
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <Skeleton className="h-[400px]" enableAnimation={true} />
                  </CardContent>
                </Card>
              ) : receivedPaymentsData.length > 0 ? (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-600 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400">
                            Received Payments
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-0.5">
                            Successfully collected - {getMonthYearText()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="h-6 px-2 text-xs font-semibold bg-green-600">
                        {receivedPaymentsData.length}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="divide-y">
                      {receivedPaymentsData.map((payment) => {
                        const getPaymentModeIcon = (mode) => {
                          switch (mode?.toLowerCase()) {
                            case "cash":
                              return <Banknote className="h-4 w-4" />;
                            case "upi":
                              return <Wallet className="h-4 w-4" />;
                            case "card":
                              return <CreditCard className="h-4 w-4" />;
                            case "netbanking":
                            case "bank_transfer":
                              return <Building2 className="h-4 w-4" />;
                            default:
                              return <MoreHorizontal className="h-4 w-4" />;
                          }
                        };

                        const formatPaymentMode = (mode) => {
                          if (!mode) return "Cash";
                          return mode
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ");
                        };

                        return (
                          <div
                            key={payment._id}
                            className="p-4 hover:bg-accent/50 transition-colors active:bg-accent"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-sm line-through decoration-green-600/40 truncate">
                                    {payment.cname}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="text-xs shrink-0 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                                  >
                                    ₹{payment.amount?.toLocaleString()}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                  {payment.caddress}
                                </p>
                                <div className="flex items-center gap-3 text-xs">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    {getPaymentModeIcon(payment.payment_method)}
                                    <span>
                                      {formatPaymentMode(
                                        payment.payment_method
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Package className="h-3 w-3" />
                                    <span>
                                      {format(
                                        new Date(payment.payment_date),
                                        "dd MMM"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Empty State - Mobile Optimized */}
              {!isLoading &&
                !isLoadingPayments &&
                stats.pending === 0 &&
                stats.completed === 0 && (
                  <Card className="overflow-hidden">
                    <CardContent className="p-8 sm:p-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                          <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">
                          No payments yet
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Payment details will appear here once customers start
                          making deliveries
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </SkeletonTheme>
    </>
  );
}
