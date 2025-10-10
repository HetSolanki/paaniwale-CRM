import { File, ListFilter } from "lucide-react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/UI/shadcn-UI/dropdown-menu";
import { Tabs, TabsContent } from "@/Components/UI/shadcn-UI/tabs";
import { TooltipProvider } from "@/Components/UI/shadcn-UI/tooltip";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DatePickerForm } from "../UI/UI-Components/Datepicker";
import { useEffect, useState, useMemo } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { DataTable } from "@/Components/DataTables/CustomerEntryDatadatatable";
import { columns1 } from "@/ColumnsSchema/CustomersEntryDataColums";
import CustomerEntryContext from "@/Context/CustomerEntryContext";
import { useLocation, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPDFGenarator from "./ReportPDFGenarator";
import { useUser } from "@/Context/UserContext";
import logo from "@/assets/paniwalalogo.png";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

const CustomerEntryData = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize intialdata to prevent dependency changes
  const intialdata = useMemo(
    () => (Array.isArray(location.state) ? location.state : []),
    [location.state]
  );

  const [customers, setCustomers] = useState(intialdata);
  const [presentcheck, setPresentcheck] = useState(false);
  const [absentcheck, setAbsentcheck] = useState(false);
  const [loading, setLoading] = useState(intialdata.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    // If no initial data (e.g., page refresh), fetch it
    if (!intialdata || intialdata.length === 0) {
      const fetchTodaysCustomers = async () => {
        try {
          setLoading(true);
          setError(null);

          const token = localStorage.getItem("token");
          const customers = await fetch(
            `${DOMAIN_NAME}/api/customerentry/getallcustomerentrys/`,
            {
              method: "GET",
              headers: {
                authorization: "Bearer " + token,
              },
            }
          );

          if (!customers.ok) {
            throw new Error(`HTTP error! status: ${customers.status}`);
          }

          const res = await customers.json();

          if (res.status === "success") {
            const todayscustomer = res.data.filter((customer) => {
              return (
                customer &&
                customer.cid &&
                customer.delivery_date ===
                  new Date(Date.now()).toISOString().split("T")[0]
              );
            });
            setCustomers(todayscustomer);
          } else {
            throw new Error(res.message || "Failed to fetch customer entries");
          }
        } catch (err) {
          console.error("Error fetching customer entries:", err);
          setError(err.message);
          setCustomers([]);
        } finally {
          setLoading(false);
        }
      };

      fetchTodaysCustomers();
    }
  }, [navigate, intialdata]);

  const pdfData = customers
    .filter((customer) => customer && customer.cid) // Filter out null/undefined entries
    .map((customer) => {
      return {
        delivery_sequence_number: customer.cid?.delivery_sequence_number || "",
        cname: customer.cid?.cname || "",
        bottle_count: customer.bottle_count || 0,
        delivery_date: customer.delivery_date || "",
        delivery_status: customer.delivery_status || "",
      };
    });
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
      header: "Bottle Count",
      accessorKey: "bottle_count",
    },
    {
      header: "Delivery Date",
      accessorKey: "delivery_date",
    },
    {
      header: "Delivery Status",
      accessorKey: "delivery_status",
    },
  ];

  const getallfilteredcustomers = (status) => {
    if (status === "Present") {
      const presentcustomers = intialdata.filter(
        (customer) => customer && customer.delivery_status === "Present"
      );
      setCustomers(presentcustomers);
    } else if (status === "Absent") {
      const absentcustomers = intialdata.filter(
        (customer) => customer && customer.delivery_status === "Absent"
      );
      setCustomers(absentcustomers);
    } else {
      setCustomers(intialdata);
    }
  };

  return (
    <>
      <CustomerEntryContext.Provider value={{ customers, setCustomers }}>
        <SkeletonTheme baseColor="#1c1c1c" highlightColor="#525252">
          <Navbar />
          <div className="flex min-h-screen mx-auto flex-col bg-muted/40">
            <TooltipProvider>
              <div className="flex flex-col sm:gap-4 sm:py-4">
                <main className="sm:grid sm:flex-1 items-start sm:gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                  <Tabs defaultValue="all">
                    <TabsContent value="all">
                      <Card x-chunk="dashboard-06-chunk-0">
                        {loading ? (
                          <div className="mt-4 py-3 px-4">
                            <Skeleton
                              className="h-[90px]"
                              enableAnimation={true}
                            />
                          </div>
                        ) : error ? (
                          <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl text-red-500">
                              Error Loading Data
                            </CardTitle>
                            <CardDescription className="text-red-400">
                              {error}. Please try again.
                            </CardDescription>
                            <Button
                              onClick={() => window.location.reload()}
                              className="mt-2 w-fit"
                            >
                              Retry
                            </Button>
                          </CardHeader>
                        ) : (
                          <>
                            <CardHeader className="">
                              <CardTitle className="flex flex-col sm:flex-row gap-4 text-xl sm:text-2xl">
                                Customers Entry Data
                                <div className="sm:ml-auto flex items-center self-start gap-2 sm:float-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1"
                                      >
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                          Filter
                                        </span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Filter by
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuCheckboxItem
                                        checked={presentcheck}
                                        onClick={() => {
                                          setPresentcheck(!presentcheck);
                                          if (!presentcheck === true) {
                                            getallfilteredcustomers("Present");
                                          } else {
                                            getallfilteredcustomers("All");
                                          }
                                        }}
                                      >
                                        Present
                                      </DropdownMenuCheckboxItem>
                                      <DropdownMenuCheckboxItem
                                        checked={absentcheck}
                                        onClick={() => {
                                          setAbsentcheck(!absentcheck);
                                          if (!absentcheck === true) {
                                            getallfilteredcustomers("Absent");
                                          } else {
                                            getallfilteredcustomers("All");
                                          }
                                        }}
                                      >
                                        Absent
                                      </DropdownMenuCheckboxItem>
                                      {/* <DropdownMenuCheckboxItem>
                                Archived
                              </DropdownMenuCheckboxItem> */}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <PDFDownloadLink
                                    document={
                                      <ReportPDFGenarator
                                        data={pdfData}
                                        columns={pdfColumns}
                                        table_name={"Customer Entry Data"}
                                        shop_name={user?.shop_name}
                                        logo={logo}
                                      />
                                    }
                                    fileName="customers_entry_data.pdf"
                                  >
                                    {({ loading }) => (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 gap-1"
                                        disabled={loading}
                                      >
                                        <File className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                          Export
                                        </span>
                                      </Button>
                                    )}
                                  </PDFDownloadLink>
                                  <Button size="sm" className="h-8 gap-1">
                                    <span
                                      onClick={() => {
                                        navigate("/customerentry");
                                      }}
                                    >
                                      Back to Entry
                                    </span>
                                  </Button>
                                </div>
                              </CardTitle>
                              <CardDescription className="hidden sm:block">
                                <div className=" mt-4 flex items-center gap-1 float-end">
                                  <DatePickerForm />
                                </div>
                                List of all the customers and their entries
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="">
                              {loading ? (
                                <div className="py-3 px-4 mb-4">
                                  <Skeleton
                                    className="h-[300px]"
                                    enableAnimation={true}
                                  />
                                </div>
                              ) : (
                                <DataTable
                                  data={customers}
                                  columns={columns1}
                                />
                              )}
                            </CardContent>
                          </>
                        )}
                      </Card>
                    </TabsContent>
                  </Tabs>
                </main>
              </div>
            </TooltipProvider>
            <ToastContainer />
          </div>
        </SkeletonTheme>
      </CustomerEntryContext.Provider>
    </>
  );
};

export default CustomerEntryData;
