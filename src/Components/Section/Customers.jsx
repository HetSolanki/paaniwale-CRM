import { File, Users, MapPin, IndianRupee } from "lucide-react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import {
  Tabs,
  TabsContent,
  // TabsList,
  // TabsTrigger,
} from "@/Components/UI/shadcn-UI/tabs";
import {
  // Tooltip,
  // TooltipContent,
  // TooltipTrigger,
  TooltipProvider,
} from "@/Components/UI/shadcn-UI/tooltip";
import Navbar from "./Navbar";
import { Addcustomer } from "../UI/UI-Components/Addcustomer";
import { DataTable } from "@/Components/DataTables/CustomerDataTable";
import InvoiceAll from "./InvoiceAll";
import ReportPDFGenarator from "./ReportPDFGenarator";

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

  // Authentication check
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch customers data
  const { data: customersData, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  // Calculate stats from customer data
  const totalCustomers = customersData?.data?.length || 0;
  const averageBottlePrice = customersData?.data?.length > 0 
    ? (customersData.data.reduce((sum, customer) => sum + (parseFloat(customer.bottle_price) || 0), 0) / totalCustomers).toFixed(2)
    : "0.00";
  const customersWithAddress = customersData?.data?.filter(c => c.caddress && c.caddress.trim() !== "").length || 0;

  // Prepare data for PDF export
  const pdfData =
    customersData?.data?.map((customer) => ({
      delivery_sequence_number: customer.delivery_sequence_number,
      cname: customer.cname,
      cphone_number: customer.cphone_number,
      caddress: customer.caddress,
      bottle_price: customer.bottle_price,
    })) || [];

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
          <div className="pb-6">
            {/* Header Section - Mobile Optimized */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Customers
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Manage your customers and view their sales performance
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                          className="h-9 gap-1.5"
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

            <TooltipProvider>
              <div className="px-4 pt-4 sm:px-6 sm:pt-6">
                {/* Stats Cards - Mobile Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {/* Total Customers */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          <p className="text-[10px] sm:text-xs font-medium">
                            Total
                          </p>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold tracking-tight text-blue-600">
                          {isLoading ? <Skeleton width={40} /> : totalCustomers}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Average Bottle Price */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                          <p className="text-[10px] sm:text-xs font-medium">
                            Avg Price
                          </p>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold tracking-tight text-green-600">
                          {isLoading ? (
                            <Skeleton width={60} />
                          ) : (
                            `₹${averageBottlePrice}`
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* With Address */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <p className="text-[10px] sm:text-xs font-medium">
                            Address
                          </p>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold tracking-tight text-purple-600">
                          {isLoading ? <Skeleton width={40} /> : customersWithAddress}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Table */}
                <Tabs defaultValue="all">
                  <TabsContent value="all">
                    <Card>
                      {!isLoading ? (
                        <CardHeader className="px-4 sm:px-6 border-b bg-muted/50">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <CardTitle className="text-base sm:text-lg">
                                All Customers
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm mt-0.5">
                                Complete list of all customers
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      ) : (
                        <div className="p-4">
                          <Skeleton className="h-[70px]" enableAnimation={true} />
                        </div>
                      )}

                      <CardContent className="p-0">
                        {!isLoading ? (
                          <div className="px-2 sm:px-4">
                            <DataTable
                              data={customersData?.data || []}
                              columns={columns}
                            />
                          </div>
                        ) : (
                          <div className="p-4">
                            <Skeleton className="h-[400px]" enableAnimation={true} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </TooltipProvider>
            <ToastContainer />
          </div>
        </div>
      </SkeletonTheme>
    </>
  );
};

export default Customers;
