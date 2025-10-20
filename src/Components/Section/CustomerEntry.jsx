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
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "@/Hooks/fetchAllCustomers";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export default function CustomerEntry() {
  const navigate = useNavigate();

  const customers = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    enabled: !!localStorage.getItem("token"), // Only fetch if token exists
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });

  const { theme } = useTheme();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleNavigate = async () => {
    navigate("/customerentrydata");
  };

  // const getintialdata = async () => {
  //   alert(new Date(Date.now()).toISOString().split("T")[0]);
  //   const token = localStorage.getItem("token");
  //   const customers = await fetch(
  //     `${DOMAIN_NAME}/api/customerentry/getallcustomerentrys/`,
  //     {
  //       method: "GET",
  //       headers: {
  //         authorization: "Bearer " + token,
  //       },
  //     }
  //   );
  //   const res = await customers.json();
  //   if (res.status === "success") {
  //     const todayscustomer = res.data.filter((customer) => {
  //       return (
  //         customer &&
  //         customer.cid &&
  //         customer.delivery_date ===
  //           new Date(Date.now()).toISOString().split("T")[0]
  //       );
  //     });
  //     return todayscustomer;
  //   } else {
  //     return [];
  //   }
  // };

  return (
    <SkeletonTheme
      baseColor={`${theme === "dark" ? "#1c1c1c" : ""}`}
      highlightColor={`${theme === "dark" ? "#525252" : ""}`}
    >
      <div>
        <Navbar />
        <div className="p-2 py-4 sm:p-8">
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
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
                disabled={customers?.isLoading}
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="px-3 sm:p-6">
              <DataTable data={customers?.data?.data || []} columns={columns} />
            </CardContent>
          </Card>
        </div>
      </div>
    </SkeletonTheme>
  );
}
