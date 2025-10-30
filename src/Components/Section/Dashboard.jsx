import {
  CreditCard,
  Users,
  TrendingUp,
  Package,
  DollarSign,
  IndianRupee,
  Wallet,
  CreditCard as CardIcon,
  Banknote,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { DataTable } from "@/Components/UI/shadcn-UI/DataTable";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { GetdashboardData } from "@/Handlers/GetdashboardData";
import { columns } from "@/ColumnsSchema/DashboardColumns";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/UI/shadcn-UI/dialog";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { Toaster } from "@/Components/UI/shadcn-UI/toaster";
import { config } from "@/Data/config";
import { useQueryClient } from "@tanstack/react-query";

export function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: GetdashboardData,
    enabled: !!localStorage.getItem("token"),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/signin");
    }
  }, [navigate]);

  const transformedTopCustomers =
    data?.topCustomers?.map((customer, index) => ({
      _id: customer.cid,
      id: index + 1,
      cname: customer.customerDetails.cname,
      cphone_number: customer.customerDetails.cphone_number,
      bottle_price: customer.customerDetails.bottle_price,
      totalRevenue: customer.totalRevenue,
    })) || [];

  // Log dashboard data for debugging

  // Calculate additional stats
  const totalPaidAmount =
    (data?.totalRevenue || 0) - (data?.totalDueAmount || 0);
  const paymentCompletionRate = data?.totalRevenue
    ? ((totalPaidAmount / data.totalRevenue) * 100).toFixed(1)
    : 0;

  // Handle payment entry (Full payment only)
  const handleAddPayment = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${config.baseUrl}/api/paymentdetails/addpaymentdetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({
            cid: selectedCustomer.cid,
            amount: selectedCustomer.totalDue,
            payment_date: new Date().toISOString(),
            payment_status: "completed",
            payment_method: paymentMode,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast({
          title: "Payment Received Successfully",
          description: `Full payment of ₹${selectedCustomer.totalDue.toLocaleString(
            "en-IN"
          )} received from ${
            selectedCustomer.customerDetails.cname
          } via ${paymentMode.toUpperCase()}`,
        });

        // Refresh dashboard data
        refetch();
        queryClient.invalidateQueries({ queryKey: ["paymentdetails"] });
        queryClient.invalidateQueries({ queryKey: ["allPayments"] });

        // Close dialog and reset
        setShowPaymentDialog(false);
        setSelectedCustomer(null);
        setPaymentAmount("");
        setPaymentMode("cash");
      } else {
        throw new Error(result.message || "Failed to add payment");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add payment entry",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentDialog = (customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount(customer.totalDue.toString());
    setPaymentMode("cash");
    setShowPaymentDialog(true);
  };

  return (
    <SkeletonTheme
      baseColor={`${theme === "dark" ? "#1c1c1c" : ""}`}
      highlightColor={`${theme === "dark" ? "#525252" : ""}`}
    >
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 md:gap-6 md:p-6 lg:p-8">
          {/* Stats Grid - Mobile Optimized */}
          <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {/* Total Revenue Card */}
            {data ? (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{(data?.totalRevenue || 0).toLocaleString("en-IN")}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Total sales amount
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Skeleton
                className="h-[110px] sm:h-[130px] w-full rounded-lg"
                enableAnimation={true}
              />
            )}

            {/* Total Customers Card */}
            {data ? (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Customers
                  </CardTitle>
                  <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                  <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {data?.totalCustomerData || 0}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Active customers
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Skeleton
                className="h-[110px] sm:h-[130px] w-full rounded-lg"
                enableAnimation={true}
              />
            )}

            {/* Total Paid Card */}
            {data ? (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Paid
                  </CardTitle>
                  <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                  <div className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{totalPaidAmount.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {paymentCompletionRate}% paid
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Skeleton
                className="h-[110px] sm:h-[130px] w-full rounded-lg"
                enableAnimation={true}
              />
            )}

            {/* Total Due Card */}
            {data ? (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Due
                  </CardTitle>
                  <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                  <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ₹{(data?.totalDueAmount || 0).toLocaleString("en-IN")}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {data?.pendingPaymentCustomersCount || 0} pending
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Skeleton
                className="h-[110px] sm:h-[130px] w-full rounded-lg"
                enableAnimation={true}
              />
            )}
          </div>

          {/* Main Content Grid - Mobile Optimized */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
            {/* Top Revenue Customers - Full width on mobile */}
            {data ? (
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader className="border-b bg-muted/50 px-3 py-3 sm:px-6 sm:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm sm:text-lg">
                        Top Revenue Customers
                      </CardTitle>
                      <CardDescription className="text-[10px] sm:text-sm mt-0.5 sm:mt-1">
                        Top 5 customers with highest revenue
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="w-fit text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5"
                    >
                      {transformedTopCustomers.length} Customers
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {transformedTopCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-3" />
                      <h3 className="text-sm sm:text-base font-semibold mb-1">
                        No Data Available
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground text-center">
                        Start adding customer entries to see revenue data
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 sm:p-4">
                      <DataTable
                        columns={columns}
                        data={transformedTopCustomers}
                        filterColumn="cname"
                        filterPlaceholder="Search customers..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="lg:col-span-2">
                <Skeleton
                  className="h-[350px] sm:h-[400px] w-full rounded-lg"
                  enableAnimation={true}
                />
              </div>
            )}

            {/* Due Payment Details - Stacks below on mobile */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Payment Overview Card */}
              {data ? (
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/50 px-3 pt-3 sm:px-6 sm:pt-4">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                      Payment Overview
                    </CardTitle>
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="pt-3 px-3 pb-3 sm:pt-4 sm:px-6 sm:pb-4">
                    <div className="flex items-baseline gap-2">
                      <div className="text-xl sm:text-2xl font-bold">
                        {data?.pendingPaymentCustomersCount || 0}
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        / {data?.totalCustomerData || 0}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      Customers with pending payments
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Skeleton
                  className="h-[110px] sm:h-[130px] w-full rounded-lg"
                  enableAnimation={true}
                />
              )}

              {/* Due Payment List Card - Mobile Optimized */}
              {data ? (
                <Card className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/50 px-3 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm sm:text-lg">
                        Due Payments
                      </CardTitle>
                      {data?.pendingPaymentCustomersCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] sm:text-xs px-2 py-0.5"
                        >
                          {data?.pendingPaymentCustomersCount} Pending
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[10px] sm:text-sm mt-0.5 sm:mt-1">
                      Customers with outstanding payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {data?.pendingPaymentCustomers?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-2 sm:mb-3">
                          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold mb-1">
                          All Clear!
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground text-center">
                          No pending payments
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                        {data?.pendingPaymentCustomers?.map(
                          (customer, index) => (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">
                                  {customer.customerDetails.cname}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                  {customer.customerDetails.cphone_number}
                                </p>
                              </div>
                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:ml-4">
                                <div className="text-sm sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
                                  ₹{customer.totalDue.toLocaleString("en-IN")}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-3"
                                  onClick={() => openPaymentDialog(customer)}
                                >
                                  Add Payment
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Skeleton
                  className="h-[350px] sm:h-[400px] w-full rounded-lg"
                  enableAnimation={true}
                />
              )}
            </div>
          </div>
        </main>

        {/* Payment Dialog - Mobile Optimized */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[425px] p-4 sm:p-6">
            <DialogHeader className="space-y-1 sm:space-y-2">
              <DialogTitle className="text-base sm:text-lg">
                Receive Full Payment
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Record full payment for{" "}
                {selectedCustomer?.customerDetails.cname}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="customer" className="text-xs sm:text-sm">
                  Customer
                </Label>
                <Input
                  id="customer"
                  value={selectedCustomer?.customerDetails.cname || ""}
                  disabled
                  className="bg-muted text-xs sm:text-sm h-8 sm:h-10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={selectedCustomer?.customerDetails.cphone_number || ""}
                  disabled
                  className="bg-muted text-xs sm:text-sm h-8 sm:h-10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="amount" className="text-xs sm:text-sm">
                  Full Payment Amount
                </Label>
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedCustomer?.totalDue.toLocaleString("en-IN") || 0}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Full payment will be received
                </p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="paymentMode" className="text-xs sm:text-sm">
                  Payment Mode
                </Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        <span>Cash</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="upi">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>UPI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CardIcon className="h-4 w-4" />
                        <span>Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="netbanking">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Net Banking</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Bank Transfer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <MoreHorizontal className="h-4 w-4" />
                        <span>Other</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setSelectedCustomer(null);
                  setPaymentAmount("");
                  setPaymentMode("cash");
                }}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPayment}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Processing..." : "Receive Full Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </SkeletonTheme>
  );
}
