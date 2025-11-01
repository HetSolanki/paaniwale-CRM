import { File, Users, MapPin, Phone, DollarSign } from "lucide-react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import Navbar from "./Navbar";
import { Addcustomer } from "../UI/UI-Components/Addcustomer";
import { DataTable } from "@/Components/UI/shadcn-UI/DataTable";
import InvoiceAll from "./InvoiceAll";
import ReportPDFGenarator from "./ReportPDFGenarator";
import { Badge } from "@/Components/UI/shadcn-UI/badge";

// Schemas and hooks
import { columns } from "../../ColumnsSchema/CustomersColumns";
import { fetchCustomers } from "@/Hooks/fetchAllCustomers";
import { useUser } from "@/Context/UserContext";
import { useTheme } from "@/Context/ThemeProviderContext ";

// Assets
import logo from "@/assets/paniwalalogo.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ToastContainer } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

const Customers = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { theme } = useTheme();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch customers data
  const { data: customersData, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    enabled: !!localStorage.getItem("token"), // Only fetch if token exists
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });

  // Prepare data for PDF export
  const pdfData =
    customersData?.data?.map((customer) => ({
      delivery_sequence_number: customer.delivery_sequence_number,
      cname: customer.cname,
      cphone_number: customer.cphone_number,
      caddress: customer.caddress,
      bottle_price: customer.bottle_price,
    })) || [];

  // Calculate stats
  const stats = {
    totalCustomers: customersData?.data?.length || 0,
    totalAddresses:
      new Set(customersData?.data?.map((c) => c.caddress)).size || 0,
    totalPhones:
      customersData?.data?.filter((c) => c.cphone_number).length || 0,
    avgBottlePrice:
      customersData?.data?.length > 0
        ? Math.round(
            customersData.data.reduce(
              (sum, c) => sum + (c.bottle_price || 0),
              0
            ) / customersData.data.length
          )
        : 0,
  };

  const pdfColumns = [
    {
      header: "Sequence Number",
      accessorKey: "delivery_sequence_number",
    },
    {
      header: "Customer Name",
      accessorKey: "cname",
    },
    {
      header: "Phone Number",
      accessorKey: "cphone_number",
    },
    {
      header: "Address",
      accessorKey: "caddress",
    },
    {
      header: "Bottle Price",
      accessorKey: "bottle_price",
    },
  ];

  return (
    <>
      <SkeletonTheme
        baseColor={theme === "dark" ? "#1c1c1c" : ""}
        highlightColor={theme === "dark" ? "#525252" : ""}
      >
        <div className="min-h-screen bg-background">
          <Navbar />

          {/* Mobile-Optimized Container */}
          <div className="pb-6 sm:pb-8">
            {/* Header Section - Mobile Optimized */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Customers
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Manage your customers and view their details
                  </p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <InvoiceAll />
                  {pdfData.length > 0 && (
                    <PDFDownloadLink
                      document={
                        <ReportPDFGenarator
                          data={pdfData}
                          columns={pdfColumns}
                          table_name="Customer Data"
                          shop_name={user?.shop_name || ""}
                          logo={logo}
                        />
                      }
                      fileName="customers_data.pdf"
                    >
                      {({ loading }) => (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 sm:h-9 gap-1 sm:gap-1.5"
                          disabled={loading}
                        >
                          <File className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                      )}
                    </PDFDownloadLink>
                  )}
                  <Addcustomer />
                </div>
              </div>
            </div>

            {/* Stats Cards - Mobile Grid */}
            <div className="px-4 pt-4 sm:px-6 sm:pt-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
                {/* Total Customers Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Total
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                          {isLoading ? (
                            <Skeleton width={40} />
                          ) : (
                            stats.totalCustomers
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Addresses Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Locations
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-green-600">
                          {isLoading ? (
                            <Skeleton width={40} />
                          ) : (
                            stats.totalAddresses
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* With Contact Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Contacts
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-600">
                          {isLoading ? (
                            <Skeleton width={40} />
                          ) : (
                            stats.totalPhones
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Avg Bottle Price Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <p className="text-xs sm:text-sm font-medium">
                            Avg Price
                          </p>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-orange-600">
                          {isLoading ? (
                            <Skeleton width={60} />
                          ) : (
                            `₹${stats.avgBottlePrice}`
                          )}
                        </p>
                      </div>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customers Table Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-semibold">
                          All Customers
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-0.5">
                          Complete customer database
                        </CardDescription>
                      </div>
                    </div>
                    {stats.totalCustomers > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-6 px-2 text-xs font-semibold"
                      >
                        {stats.totalCustomers}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 sm:p-6">
                      <Skeleton className="h-[300px]" enableAnimation={true} />
                    </div>
                  ) : (customersData?.data || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <File className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        No customers yet
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-sm mb-4">
                        Start by adding your first customer
                      </p>
                      <Addcustomer />
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6">
                      <DataTable
                        data={customersData?.data || []}
                        columns={columns}
                        filterColumn="cname"
                        filterPlaceholder="Search customer name..."
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
};

export default Customers;
