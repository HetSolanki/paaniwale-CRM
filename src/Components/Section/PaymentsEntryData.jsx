import { File, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { Tabs, TabsContent } from "@/Components/UI/shadcn-UI/tabs";
import { TooltipProvider } from "@/Components/UI/shadcn-UI/tooltip";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/Components/UI/shadcn-UI/DataTable";
import { columns1 } from "@/ColumnsSchema/PaymentsEntryDataColumns";
import { useLocation, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPDFGenarator from "./ReportPDFGenarator";
import { useUser } from "@/Context/UserContext";
import logo from "@/assets/paniwalalogo.png";

const PaymentsEntryData = () => {
  const { user } = useUser();
  const location = useLocation();
  const intialdata = location.state;
  const navigate = useNavigate();
  const [paymentEntrys, setPaymentEntrys] = useState([...intialdata]);

  // Date filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [receivedcheck, setReceivedcheck] = useState(false);
  const [pendingcheck, setPendingcheck] = useState(false);

  useEffect(() => {
    if (intialdata === undefined || intialdata.length === 0) {
      navigate("/paymentdetails");
    }
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [intialdata, navigate]);

  // Combined filtering for both date and status
  const filteredPayments = useMemo(() => {
    let payments = paymentEntrys || [];

    // Apply status filter first
    if (receivedcheck && !pendingcheck) {
      payments = payments.filter(
        (payment) => payment.payment_status === "Received"
      );
    } else if (pendingcheck && !receivedcheck) {
      payments = payments.filter(
        (payment) => payment.payment_status === "Pending"
      );
    }

    // Then apply date filter
    if (dateFilter === "all") return payments;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return payments.filter((payment) => {
      const paymentDate = new Date(payment.payment_date);

      if (isNaN(paymentDate.getTime())) {
        return false;
      }

      const paymentDay = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth(),
        paymentDate.getDate()
      );

      switch (dateFilter) {
        case "today": {
          return paymentDay.getTime() === today.getTime();
        }
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return paymentDay.getTime() === yesterday.getTime();
        }
        case "last7days": {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return paymentDay >= sevenDaysAgo && paymentDay <= today;
        }
        case "thisMonth": {
          return (
            paymentDate.getMonth() === now.getMonth() &&
            paymentDate.getFullYear() === now.getFullYear()
          );
        }
        case "thisYear": {
          return paymentDate.getFullYear() === now.getFullYear();
        }
        case "custom": {
          if (!customDate) return false;
          const selectedDay = new Date(
            customDate.getFullYear(),
            customDate.getMonth(),
            customDate.getDate()
          );
          return paymentDay.getTime() === selectedDay.getTime();
        }
        default:
          return true;
      }
    });
  }, [paymentEntrys, dateFilter, customDate, receivedcheck, pendingcheck]);

  // Handle date filter change
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value !== "custom") {
      setCustomDate(null);
      setShowCalendar(false);
    } else {
      setShowCalendar(true);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setDateFilter("all");
    setCustomDate(null);
    setShowCalendar(false);
  };

  const pdfdata = filteredPayments.map((data) => {
    return {
      Customer_Name: data?.cid?.cname,
      Phone_Number: data?.cid?.cphone_number,
      Bottle_Price: data?.cid?.bottle_price,
      Amount: data?.amount,
      Payment_Date: data?.payment_date,
      Payment_Status: data?.payment_status,
    };
  });

  const pdfColumns = [
    {
      header: "Customer Name",
      accessorKey: "Customer_Name",
    },
    {
      header: "Phone Number",
      accessorKey: "Phone_Number",
    },
    {
      header: "Bottle Price",
      accessorKey: "Bottle_Price",
    },
    {
      header: "Amount",
      accessorKey: "Amount",
    },
    {
      header: "Payment Date",
      accessorKey: "Payment_Date",
    },
    {
      header: "Payment Status",
      accessorKey: "Payment_Status",
    },
  ];

  const getallfilteredcustomers = (status) => {
    if (status === "Received") {
      setReceivedcheck(true);
      setPendingcheck(false);
    } else if (status === "Pending") {
      setPendingcheck(true);
      setReceivedcheck(false);
    } else {
      setReceivedcheck(false);
      setPendingcheck(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen mx-auto w-screen flex-col bg-muted/40">
        <TooltipProvider>
          <div className="flex flex-col sm:gap-4 sm:py-4">
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              <Tabs defaultValue="all">
                <TabsContent value="all">
                  <Card x-chunk="dashboard-06-chunk-0">
                    <CardHeader>
                      <CardTitle className="flex-col sm:flex-row sm:flex sm:items-center sm:justify-between">
                        <span className="text-xl font-semibold text-primary sm:text-2xl">
                          Payment Entry Data
                        </span>
                        <div className="flex mt-5 sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                          {/* Status Filter Badges */}
                          <div className="flex gap-2">
                            <Badge
                              variant={receivedcheck ? "default" : "outline"}
                              className={`cursor-pointer ${
                                receivedcheck
                                  ? "bg-emerald-600 hover:bg-emerald-700"
                                  : "hover:bg-emerald-50"
                              }`}
                              onClick={() => {
                                if (receivedcheck) {
                                  getallfilteredcustomers("All");
                                } else {
                                  getallfilteredcustomers("Received");
                                }
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Received
                            </Badge>
                            <Badge
                              variant={pendingcheck ? "default" : "outline"}
                              className={`cursor-pointer ${
                                pendingcheck
                                  ? "bg-orange-600 hover:bg-orange-700"
                                  : "hover:bg-orange-50"
                              }`}
                              onClick={() => {
                                if (pendingcheck) {
                                  getallfilteredcustomers("All");
                                } else {
                                  getallfilteredcustomers("Pending");
                                }
                              }}
                            >
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          <PDFDownloadLink
                            document={
                              <ReportPDFGenarator
                                data={pdfdata}
                                columns={pdfColumns}
                                table_name={"Customer Data"}
                                shop_name={user?.shop_name}
                                logo={logo}
                              />
                            }
                            fileName="Payment_data.pdf"
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
                          <span
                            onClick={() => {
                              navigate("/paymentdetails");
                            }}
                          >
                            <Button size="sm" className="h-8 gap-1">
                              Back to Entry
                            </Button>
                          </span>
                        </div>
                      </CardTitle>
                      <CardDescription className="hidden sm:block">
                        <div className="mt-4 flex items-center gap-1 float-end">
                          {/* <DatePickerForm /> */}
                        </div>
                        List of all the customers and their entries
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <DataTable
                        data={filteredPayments}
                        columns={columns1}
                        filterColumn="cid"
                        filterPlaceholder="Search customer..."
                        dateFilter={dateFilter}
                        customDate={customDate}
                        showCalendar={showCalendar}
                        setShowCalendar={setShowCalendar}
                        handleDateFilterChange={handleDateFilterChange}
                        resetFilters={resetFilters}
                        setCustomDate={setCustomDate}
                      />
                    </CardContent>

                    {/* <CardFooter>
                      <div className="text-xs text-muted-foreground">
                        Showing <strong>1-10</strong> of <strong>32</strong>{" "}
                        customers
                      </div>
                    </CardFooter> */}
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </TooltipProvider>
        <ToastContainer />
      </div>
    </>
  );
};

export default PaymentsEntryData;
