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
  TrendingUp,
  Users,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useEffect, useState } from "react";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { useQuery } from "@tanstack/react-query";
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
import { fetchTodaysEntries } from "@/Hooks/fetchTodaysEntries";
import { useQueryClient } from "@tanstack/react-query";

export default function CustomerEntry() {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewEntriesDialogOpen, setViewEntriesDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editBottleCount, setEditBottleCount] = useState(0);
  const [todayEntryId, setTodayEntryId] = useState(null);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ["customersEntries"],
    queryFn: fetchTodaysEntries,
    enabled: !!localStorage.getItem("token"),
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });

  const { theme } = useTheme();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleNavigate = async () => {
    navigate("/customerentrydata");
  };

  const handleEditEntry = (customer) => {
    const entryData = customer?.todayEntryDetails;
    setSelectedCustomer(customer);
    setEditBottleCount(entryData?.bottle_count || 0);
    setTodayEntryId(entryData?._id || null);
    setEditDialogOpen(true);
  };

  const handleUpdateEntry = async () => {
    if (!todayEntryId || !selectedCustomer) return;

    try {
      const res = await updateCustomerEntryAPI(todayEntryId, {
        cid: selectedCustomer._id,
        bottle_count: parseInt(editBottleCount),
        delivery_status: "Present",
      });

      if (res.status === "success") {
        toast.success("Entry updated successfully", {
          autoClose: 1000,
        });
        setEditDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["customersEntries"] });
        queryClient.invalidateQueries({ queryKey: ["allCustomerEntries"] });
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
    const entryData = customer.todayEntryDetails;
    if (!entryData?._id) return;

    if (!window.confirm(`Delete entry for ${customer.cname}?`)) return;

    try {
      const res = await deleteCustomerEntryAPI(entryData._id);

      if (res.status === "success") {
        toast.success("Entry deleted successfully", {
          autoClose: 1000,
        });
        queryClient.invalidateQueries({ queryKey: ["customersEntries"] });
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

  const { data: customerAllEntries = [] } = useQuery({
    queryKey: ["allCustomerEntries", selectedCustomer?._id],
    queryFn: async () => await getAllCustomerEntries(selectedCustomer._id),
    enabled: viewEntriesDialogOpen && !!selectedCustomer?._id,
    staleTime: 5 * 60 * 1000,
  });

  const handleViewAllEntries = async (customer) => {
    setSelectedCustomer(customer);
    setViewEntriesDialogOpen(true);
  };

  return (
    <SkeletonTheme
      baseColor={`${theme === "dark" ? "#1c1c1c" : ""}`}
      highlightColor={`${theme === "dark" ? "#525252" : ""}`}
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
                  Customer Entries
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
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

          {/* Stats Cards - Mobile Grid */}
          <div className="px-4 pt-4 sm:px-6 sm:pt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
              {/* Pending Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-xs sm:text-sm font-medium">
                          Pending
                        </p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {customers?.stats?.pending || 0}
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-xs sm:text-sm font-medium">Done</p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-green-600">
                        {customers?.stats?.completed || 0}
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Bottles Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-xs sm:text-sm font-medium">
                          Bottles
                        </p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">
                        {customers?.stats?.totalBottles || 0}
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Customers Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <p className="text-xs sm:text-sm font-medium">Total</p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-600">
                        {(customers?.stats?.pending || 0) +
                          (customers?.stats?.completed || 0)}
                      </p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Entries Section - Mobile Optimized */}
            {customers?.pending?.length > 0 && (
              <Card className="mb-4 sm:mb-6 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-semibold">
                          Pending Deliveries
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-0.5">
                          Awaiting today&apos;s entry
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="h-6 px-2 text-xs font-semibold"
                    >
                      {customers.pending.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {customers?.isLoading ? (
                    <div className="p-4">
                      <Skeleton className="h-[300px]" enableAnimation={true} />
                    </div>
                  ) : (
                    <>
                      <div className="p-6">
                        <DataTable data={customers.pending} columns={columns} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Completed Entries Section - Mobile Optimized */}
            {customers?.completed?.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/30 border-b px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-600 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400">
                          Completed Today
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-0.5">
                          Successfully delivered
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="h-6 px-2 text-xs font-semibold bg-green-600">
                      {customers.completed.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y">
                    {customers.completed.map((customer) => (
                      <div
                        key={customer._id}
                        className="p-4 hover:bg-accent/50 transition-colors active:bg-accent"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm line-through decoration-green-600/40 truncate">
                                {customer.cname}
                              </h3>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                              >
                                #{customer.delivery_sequence_number}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                              {customer.caddress}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleViewAllEntries(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEditEntry(customer)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEntry(customer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State - Mobile Optimized */}
            {!customers?.isLoading &&
              customers?.stats?.pending === 0 &&
              customers?.stats?.completed === 0 && (
                <Card className="overflow-hidden">
                  <CardContent className="p-8 sm:p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        No entries yet
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Add customers to start tracking their daily deliveries
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>

        {/* Edit Entry Dialog - Mobile Optimized */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg">Edit Entry</DialogTitle>
              <DialogDescription className="text-sm">
                Update bottle count for {selectedCustomer?.cname}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name" className="text-sm font-medium">
                  Customer Name
                </Label>
                <Input
                  id="customer-name"
                  value={selectedCustomer?.cname || ""}
                  disabled
                  className="bg-muted h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bottle-count" className="text-sm font-medium">
                  Bottle Count
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 shrink-0"
                    onClick={() =>
                      setEditBottleCount((prev) => Math.max(0, prev - 1))
                    }
                  >
                    <span className="text-xl">−</span>
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
                    className="text-center text-lg font-semibold h-12"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 shrink-0"
                    onClick={() => setEditBottleCount((prev) => prev + 1)}
                  >
                    <span className="text-xl">+</span>
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="w-full h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateEntry}
                disabled={editBottleCount < 0}
                className="w-full h-11"
              >
                Update Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View All Entries Dialog - Mobile Optimized */}
        <Dialog
          open={viewEntriesDialogOpen}
          onOpenChange={setViewEntriesDialogOpen}
        >
          <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[85vh] rounded-lg p-0">
            <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6 pb-4 border-b">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Delivery History
              </DialogTitle>
              <DialogDescription className="text-sm">
                {selectedCustomer?.cname}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(85vh-8rem)] px-4 sm:px-6 py-4">
              {loadingEntries ? (
                <div className="flex items-center justify-center h-40">
                  <Skeleton className="h-full w-full" enableAnimation={true} />
                </div>
              ) : customerAllEntries?.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {customerAllEntries.map((entry, index) => {
                    const entryDate = new Date(entry.delivery_date);
                    const isToday =
                      entryDate.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={entry._id || index}
                        className={`p-3 sm:p-4 rounded-lg border transition-colors ${
                          isToday
                            ? "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800"
                            : "bg-card hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div
                              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0 ${
                                isToday
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-muted"
                              }`}
                            >
                              <Calendar
                                className={`h-4 w-4 ${
                                  isToday
                                    ? "text-green-600"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-medium text-sm truncate">
                                  {entryDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                {isToday && (
                                  <Badge className="bg-green-600 text-[10px] h-5 px-1.5">
                                    Today
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <span
                                  className={
                                    entry.delivery_status === "Present"
                                      ? "text-green-600 dark:text-green-400 font-medium"
                                      : "text-orange-600 dark:text-orange-400 font-medium"
                                  }
                                >
                                  {entry.delivery_status}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-lg sm:text-xl">
                              {entry.bottle_count}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
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
                  <Package className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">No entries found</p>
                </div>
              )}
            </div>
            <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setViewEntriesDialogOpen(false)}
                className="w-full h-11"
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
