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

  useEffect(() => {
    if (intialdata === undefined || intialdata.length === 0) {
      navigate("/paymentdetails");
    }
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [intialdata, navigate]);

  const pdfdata = paymentEntrys.map((data) => {
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

  const [receivedcheck, setReceivedcheck] = useState(false);
  const [pendingcheck, setPendingcheck] = useState(false);

  const getallfilteredcustomers = (status) => {
    if (status === "Received") {
      const receivedcustomers = intialdata.filter(
        (customer) => customer.payment_status === "Received"
      );
      setPaymentEntrys(receivedcustomers);
    } else if (status === "Pending") {
      const pendingcustomers = intialdata.filter(
        (customer) => customer.payment_status === "Pending"
      );
      setPaymentEntrys(pendingcustomers);
    } else {
      setPaymentEntrys(intialdata);
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
                        <span
                          className="
                            text-xl
                            font-semibold
                            text-primary
                            sm:text-2xl"
                        >
                          Payment Entry Data
                        </span>
                        <div className=" flex mt-5 sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
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
                              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuCheckboxItem
                                checked={receivedcheck}
                                onClick={() => {
                                  setReceivedcheck(!receivedcheck);
                                  if (!receivedcheck === true) {
                                    getallfilteredcustomers("Received");
                                  } else {
                                    getallfilteredcustomers("All");
                                  }
                                }}
                              >
                                Received
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={pendingcheck}
                                onClick={() => {
                                  setPendingcheck(!pendingcheck);
                                  if (!pendingcheck === true) {
                                    getallfilteredcustomers("Pending");
                                  } else {
                                    getallfilteredcustomers("All");
                                  }
                                }}
                              >
                                Pending
                              </DropdownMenuCheckboxItem>
                              {/* <DropdownMenuCheckboxItem>
                                Archived
                              </DropdownMenuCheckboxItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                      <DataTable data={paymentEntrys} columns={columns1} />
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
