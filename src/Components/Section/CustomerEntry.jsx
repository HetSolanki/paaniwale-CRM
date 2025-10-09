import { useCustomer } from "@/Context/CustomerContext";
import { DataTable } from "@/Components/DataTables/CustomerEntryDatatable";
import { columns } from "@/ColumnsSchema/CustomersEntryColumns";
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
import { ArrowUpRight } from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useEffect } from "react";
import { useTheme } from "@/Context/ThemeProviderContext ";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export default function CustomerEntry() {
  const navigate = useNavigate();
  const { customer, loading, error } = useCustomer();

  const { theme } = useTheme();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleNavigate = async () => {
    const data = getintialdata();
    navigate("/customerentrydata", { state: await data });
  };

  const getintialdata = async () => {
    // alert(new Date(Date.now()).toISOString().split("T")[0]);
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
      return todayscustomer;
    } else {
      return [];
    }
  };

  return (
    <SkeletonTheme
      baseColor={`${theme === "dark" ? "#1c1c1c" : ""}`}
      highlightColor={`${theme === "dark" ? "#525252" : ""}`}
    >
      <div>
        <Navbar />
        <div className="p-2 py-4 sm:p-8">
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            {loading ? (
              <div className="mt-4 py-3 px-4">
                <Skeleton className="h-[90px]" enableAnimation={true} />
              </div>
            ) : error ? (
              <CardHeader className="flex flex-row items-center px-4 sm:p-6">
                <div className="grid gap-2">
                  <CardTitle className="text-xl sm:text-2xl text-red-500">
                    Error Loading Data
                  </CardTitle>
                  <CardDescription className="text-red-400">
                    {error}. Please try refreshing the page.
                  </CardDescription>
                </div>
              </CardHeader>
            ) : customer ? (
              <CardHeader className="flex flex-row items-center px-4 sm:p-6">
                <div className="grid gap-2">
                  <CardTitle className="text-xl sm:text-2xl">
                    Customer Entry
                  </CardTitle>
                  <CardDescription className="hidden sm:block">
                    List of all the customers and their entries
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="ml-auto gap-1 self-start"
                  onClick={handleNavigate}
                >
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardHeader>
            ) : null}

            {loading ? (
              <div className="py-3 px-4 mb-4">
                <Skeleton className="h-[300px]" enableAnimation={true} />
              </div>
            ) : error ? (
              <CardContent className="px-3 sm:p-6">
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Failed to load customer entries
                </div>
              </CardContent>
            ) : customer ? (
              <CardContent className="px-3 sm:p-6">
                <DataTable data={customer} columns={columns} />
              </CardContent>
            ) : null}
          </Card>
        </div>
      </div>
    </SkeletonTheme>
  );
}
