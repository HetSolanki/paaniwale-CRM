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
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Package,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "@/Hooks/fetchAllCustomers";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import {
  updateCustomerEntry as updateCustomerEntryAPI,
  deleteCustomerEntry as deleteCustomerEntryAPI,
  getAllCustomerEntries,
} from "@/Handlers/AddcustomerEntryHandler";
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
import { toast } from "react-toastify";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export default function CustomerEntry() {
  const navigate = useNavigate();
  const [customerEntries, setCustomerEntries] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewEntriesDialogOpen, setViewEntriesDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editBottleCount, setEditBottleCount] = useState(0);
  const [todayEntryId, setTodayEntryId] = useState(null);
  const [customerAllEntries, setCustomerAllEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const customers = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
    enabled: !!localStorage.getItem("token"), // Only fetch if token exists
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });

  const { theme } = useTheme();

  // Fetch today's entries count for each customer
  useEffect(() => {
    const fetchTodayEntries = async () => {
      const token = localStorage.getItem("token");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      try {
        const response = await fetch(
          `${DOMAIN_NAME}/api/customerentry/getallcustomerentrys`,
          {
            method: "GET",
            headers: {
              authorization: "Bearer " + token,
            },
          }
        );
        const res = await response.json();

        if (res.status === "success" && res.data) {
          // Count today's entries per customer (count bottle_count, not number of entries)
          const entriesMap = {};
          res.data.forEach((entry) => {
            if (!entry.cid?._id) return;

            // Compare dates properly
            const entryDate = new Date(entry.delivery_date);
            entryDate.setHours(0, 0, 0, 0);
            const entryDateStr = entryDate.toISOString().split("T")[0];

            if (entryDateStr === todayStr) {
              const customerId = entry.cid._id;
              if (!entriesMap[customerId]) {
                entriesMap[customerId] = {
                  count: 0,
                  bottles: 0,
                  entryId: entry._id,
                };
              }
              entriesMap[customerId].count += 1;
              entriesMap[customerId].bottles += entry.bottle_count || 0;
              entriesMap[customerId].entryId = entry._id; // Store latest entry ID
            }
          });
          setCustomerEntries(entriesMap);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    };

    if (customers.data?.data) {
      fetchTodayEntries();
    }
  }, [customers.data, refreshKey]);

  // Listen for entry added events to refresh the list
  useEffect(() => {
    const handleEntryAdded = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("customerEntryAdded", handleEntryAdded);
    return () =>
      window.removeEventListener("customerEntryAdded", handleEntryAdded);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  // Separate customers into pending (0 entries) and done (> 0 entries)
  const { pendingCustomers, doneCustomers, stats } = useMemo(() => {
    if (!customers.data?.data) {
      return {
        pendingCustomers: [],
        doneCustomers: [],
        stats: { pending: 0, done: 0, totalBottles: 0 },
      };
    }

    const pending = [];
    const done = [];
    let totalBottles = 0;

    customers.data.data.forEach((customer) => {
      const entryData = customerEntries[customer._id];
      const hasEntry = entryData && entryData.count > 0;

      const customerWithEntry = {
        ...customer,
        todayEntryCount: entryData ? entryData.count : 0,
        todayBottleCount: entryData ? entryData.bottles : 0,
      };

      if (!hasEntry) {
        pending.push(customerWithEntry);
      } else {
        done.push(customerWithEntry);
        totalBottles += entryData.bottles;
      }
    });

    return {
      pendingCustomers: pending,
      doneCustomers: done,
      stats: {
        pending: pending.length,
        done: done.length,
        totalBottles: totalBottles,
      },
    };
  }, [customers.data, customerEntries]);

  const handleNavigate = async () => {
    navigate("/customerentrydata");
  };

  const handleEditEntry = (customer) => {
    const entryData = customerEntries[customer._id];
    setSelectedCustomer(customer);
    setEditBottleCount(entryData?.bottles || 0);
    setTodayEntryId(entryData?.entryId || null);
    setEditDialogOpen(true);
  };

  const handleViewAllEntries = async (customer) => {
    setSelectedCustomer(customer);
    setViewEntriesDialogOpen(true);
    setLoadingEntries(true);

    try {
      const res = await getAllCustomerEntries(customer._id);

      if (res.status === "success" && res.data) {
        // Sort entries by date, most recent first
        const sortedEntries = res.data.sort(
          (a, b) => new Date(b.delivery_date) - new Date(a.delivery_date)
        );
        setCustomerAllEntries(sortedEntries);
      } else {
        setCustomerAllEntries([]);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load entries", {
        autoClose: 1000,
      });
      setCustomerAllEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleUpdateEntry = async () => {
    if (!todayEntryId || !selectedCustomer) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await updateCustomerEntryAPI(todayEntryId, {
        cid: selectedCustomer._id,
        bottle_count: parseInt(editBottleCount),
        delivery_date: today,
        delivery_status: "Present",
      });

      if (res.status === "success") {
        toast.success("Entry updated successfully", {
          autoClose: 1000,
        });
        setEditDialogOpen(false);
        setRefreshKey((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent("customerEntryAdded"));
      } else {
        toast.error(res.message || "Failed to update entry", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Error updating entry", {
        autoClose: 1000,
      });
    }
  };

  const handleDeleteEntry = async (customer) => {
    const entryData = customerEntries[customer._id];
    if (!entryData?.entryId) return;

    if (!window.confirm(`Delete entry for ${customer.cname}?`)) return;

    try {
      const res = await deleteCustomerEntryAPI(entryData.entryId);

      if (res.status === "success") {
        toast.success("Entry deleted successfully", {
          autoClose: 1000,
        });
        setRefreshKey((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent("customerEntryAdded"));
      } else {
        toast.error(res.message || "Failed to delete entry", {
          autoClose: 1000,
        });
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Error deleting entry", {
        autoClose: 1000,
      });
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Entries
                </CardDescription>
                <CardTitle className="text-3xl">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Completed Today
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {stats.done}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Bottles Delivered</CardDescription>
                <CardTitle className="text-3xl">{stats.totalBottles}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Quick Actions
                </CardDescription>
                <Button
                  onClick={handleNavigate}
                  className="w-full mt-2"
                  variant="outline"
                >
                  View All Entries
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
            </Card>
          </div>

          {/* Pending Entries Section */}
          {pendingCustomers.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center px-4 sm:p-6">
                <div className="grid gap-2">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Pending Customer Entries
                    <Badge variant="secondary" className="ml-2">
                      {pendingCustomers.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="hidden sm:block">
                    Customers waiting for today&apos;s delivery entry
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
                {customers?.isLoading ? (
                  <Skeleton className="h-[300px]" enableAnimation={true} />
                ) : (
                  <DataTable data={pendingCustomers} columns={columns} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Completed Entries Section */}
          {doneCustomers.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center px-4 sm:p-6 bg-green-50 dark:bg-green-950">
                <div className="grid gap-2">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Completed Entries Today
                    <Badge variant="default" className="ml-2 bg-green-600">
                      {doneCustomers.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="hidden sm:block">
                    Customers with completed deliveries today
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-3 sm:p-6">
                <div className="space-y-4">
                  {doneCustomers.map((customer) => (
                    <div
                      key={customer._id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base line-through">
                            {customer.cname}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">
                            {customer.caddress}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 dark:bg-green-950 whitespace-nowrap"
                        >
                          {customer.todayBottleCount}{" "}
                          {customer.todayBottleCount === 1
                            ? "bottle"
                            : "bottles"}
                        </Badge>
                        <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
                          #{customer.delivery_sequence_number}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleViewAllEntries(customer)}
                          title="View all entries"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEditEntry(customer)}
                          title="Edit today's entry"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteEntry(customer)}
                          title="Delete today's entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!customers?.isLoading &&
            pendingCustomers.length === 0 &&
            doneCustomers.length === 0 && (
              <Card>
                <CardHeader className="px-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl">
                    Customer Entry
                  </CardTitle>
                  <CardDescription className="hidden sm:block">
                    No customers found. Add customers to start tracking
                    deliveries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:p-6">
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <Clock className="h-16 w-16 mb-4" />
                    <p className="text-lg font-medium">No customers yet</p>
                    <p className="text-sm">
                      Add customers to start tracking entries
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Edit Entry Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Customer Entry</DialogTitle>
              <DialogDescription>
                Update the bottle count for {selectedCustomer?.cname}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  value={selectedCustomer?.cname || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bottle-count">Bottle Count</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setEditBottleCount((prev) => Math.max(0, prev - 1))
                    }
                  >
                    -
                  </Button>
                  <Input
                    id="bottle-count"
                    type="number"
                    min="0"
                    value={editBottleCount}
                    onChange={(e) =>
                      setEditBottleCount(
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="text-center"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setEditBottleCount((prev) => prev + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateEntry}
                disabled={editBottleCount < 0}
                className="w-full sm:w-auto"
              >
                Update Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View All Entries Dialog */}
        <Dialog
          open={viewEntriesDialogOpen}
          onOpenChange={setViewEntriesDialogOpen}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                All Entries - {selectedCustomer?.cname}
              </DialogTitle>
              <DialogDescription>
                Complete delivery history for this customer
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {loadingEntries ? (
                <div className="flex items-center justify-center h-40">
                  <Skeleton className="h-full w-full" enableAnimation={true} />
                </div>
              ) : customerAllEntries.length > 0 ? (
                <div className="space-y-3">
                  {customerAllEntries.map((entry, index) => {
                    const entryDate = new Date(entry.delivery_date);
                    const isToday =
                      entryDate.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={entry._id || index}
                        className={`p-4 border rounded-lg ${
                          isToday
                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                            : "bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {entryDate.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {isToday && (
                                  <Badge
                                    variant="default"
                                    className="ml-2 bg-green-600 text-xs"
                                  >
                                    Today
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Status:{" "}
                                <span
                                  className={
                                    entry.delivery_status === "Present"
                                      ? "text-green-600 font-medium"
                                      : "text-orange-600 font-medium"
                                  }
                                >
                                  {entry.delivery_status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              {entry.bottle_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.bottle_count === 1 ? "bottle" : "bottles"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Package className="h-12 w-12 mb-2" />
                  <p className="text-sm">No entries found</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewEntriesDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SkeletonTheme>
  );
}
