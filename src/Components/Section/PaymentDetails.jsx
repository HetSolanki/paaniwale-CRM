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
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { useQuery } from "@tanstack/react-query";
import { config } from "@/Data/config";
import { fetchpaymentdata } from "@/Handlers/fetchPaymentData";
import { Badge } from "@/Components/UI/shadcn-UI/badge";

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["paymentdetails"],
    queryFn: fetchpaymentdata,
    enabled: !!localStorage.getItem("token"),
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const transformedpaymentdata =
    data?.map((customer, index) => ({
      _id: customer?.cid,
      id: index + 1,
      cname: customer?.customer?.cname,
      cphone_number: customer?.customer?.cphone_number,
      caddress: customer?.customer?.caddress,
      totalamount: customer?.totalBottle * customer?.customer?.bottle_price,
      totalBottle: customer?.totalBottle,
      bottle_price: customer?.customer?.bottle_price,
    })) || [];

  // Calculate stats
  const totalCustomers = transformedpaymentdata.length;
  const totalAmount = transformedpaymentdata.reduce(
    (sum, item) => sum + (item.totalamount || 0),
    0
  );
  const totalBottles = transformedpaymentdata.reduce(
    (sum, item) => sum + (item.totalBottle || 0),
    0
  );

  const getintialdata = async () => {
    const token = localStorage.getItem("token");
    const entrys = await fetch(
      `${config.baseUrl}/api/paymentdetails/getAllPaymentEntrys`,
      {
        method: "GET",
        headers: {
          authorization: "Bearer " + token,
        },
      }
    );
    const res = await entrys.json();
    if (res.status === "success") {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const thisMonthCustomers = res.data.filter((customer) => {
        const PaymentDate = new Date(customer.payment_date);
        return (
          PaymentDate.getMonth() === currentMonth &&
          PaymentDate.getFullYear() === currentYear
        );
      });
      return thisMonthCustomers;
    } else {
      return [];
    }
  };

  const handleNavigate = async () => {
    const data = getintialdata();
    const paymentdata = await data;
    if (paymentdata.length === 0) {
      alert("No Data Found");
    } else {
      navigate("/paymentsdata", { state: await data });
    }
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
          <div className="pb-6">
            {/* Header Section - Mobile Optimized */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Payment Details
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Customer payment overview
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
            </div>

            <div className="px-4 pt-4 sm:px-6 sm:pt-6">
              {/* Stats Cards - Mobile Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
                {/* Total Customers */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Customers
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">
                          {isLoading ? <Skeleton width={40} /> : totalCustomers}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Amount */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Amount
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-green-600">
                          {isLoading ? (
                            <Skeleton width={60} />
                          ) : (
                            `₹${totalAmount.toLocaleString()}`
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Bottles */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Bottles
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-600">
                          {isLoading ? <Skeleton width={40} /> : totalBottles}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Per Customer */}
                <Card className="overflow-hidden ">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Avg/Customer
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-orange-600">
                          {isLoading ? (
                            <Skeleton width={50} />
                          ) : (
                            `₹${
                              totalCustomers > 0
                                ? Math.round(totalAmount / totalCustomers)
                                : 0
                            }`
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Details Table */}
              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/50 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-semibold">
                        Customer Payments
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-0.5">
                        {totalCustomers}{" "}
                        {totalCustomers === 1 ? "customer" : "customers"} with
                        pending payments
                      </CardDescription>
                    </div>
                    {totalCustomers > 0 && (
                      <Badge
                        variant="secondary"
                        className="hidden sm:inline-flex"
                      >
                        {totalCustomers}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 sm:p-6">
                      <Skeleton className="h-[300px]" enableAnimation={true} />
                    </div>
                  ) : transformedpaymentdata.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        No payment data
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-sm">
                        Payment details will appear here once customers start
                        making deliveries
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-6">
                      <DataTable
                        data={transformedpaymentdata}
                        columns={columns}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <ToastContainer />
      </SkeletonTheme>
    </>
  );
}
