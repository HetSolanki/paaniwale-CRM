import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Tabs, TabsContent } from "@/Components/UI/shadcn-UI/tabs";
import { TooltipProvider } from "@/Components/UI/shadcn-UI/tooltip";
import Navbar from "./Navbar";
import { AddPartyOrder } from "../UI/UI-Components/AddPartyOrder";
import { DataTable } from "@/Components/UI/shadcn-UI/DataTable";
import { partyOrderColumns } from "@/ColumnsSchema/PartyOrderColumns";
import { getPartyOrders, deletePartyOrder } from "@/Handlers/PartyOrderHandler";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PartyOrderInvoice } from "./PartyOrderInvoice";
import { EditPartyOrder } from "../UI/UI-Components/EditPartyOrder";
import { Package, Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/Components/UI/shadcn-UI/badge";

const PartyOrders = () => {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Date filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch party orders
  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["partyOrders"],
    queryFn: getPartyOrders,
    enabled: !!localStorage.getItem("token"),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const handlePreview = (order) => {
    if (!order || !order._id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid order selected",
      });
      return;
    }
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleEdit = (order) => {
    if (!order || !order._id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid order selected",
      });
      return;
    }
    setSelectedOrder(order);
    setShowEdit(true);
  };

  const handleSend = (order) => {
    if (!order || !order._id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid order selected",
      });
      return;
    }
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleDelete = async (order) => {
    if (!order || !order._id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid order selected",
      });
      return;
    }

    const confirmation = window.confirm(
      `Are you sure you want to delete order for ${order.party_name}?`
    );

    if (!confirmation) return;

    try {
      const result = await deletePartyOrder(order._id);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Party order deleted successfully!",
        });
        refetch();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to delete party order",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete party order",
      });
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  // Filter orders based on date filter
  const filteredOrders = useMemo(() => {
    const orders = ordersData?.data || [];

    if (dateFilter === "all") return orders;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter((order) => {
      // Handle both string and Date object formats
      const orderDate = new Date(order.delivery_date);

      // Check if date is valid
      if (isNaN(orderDate.getTime())) {
        return false;
      }

      const orderDay = new Date(
        orderDate.getFullYear(),
        orderDate.getMonth(),
        orderDate.getDate()
      );

      switch (dateFilter) {
        case "today": {
          return orderDay.getTime() === today.getTime();
        }
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDay.getTime() === yesterday.getTime();
        }
        case "last7days": {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return orderDay >= sevenDaysAgo && orderDay <= today;
        }
        case "thisMonth": {
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        }
        case "thisYear": {
          return orderDate.getFullYear() === now.getFullYear();
        }
        case "custom": {
          if (!customDate) return false;
          const selectedDay = new Date(
            customDate.getFullYear(),
            customDate.getMonth(),
            customDate.getDate()
          );
          return orderDay.getTime() === selectedDay.getTime();
        }
        default:
          return true;
      }
    });
  }, [ordersData, dateFilter, customDate]);

  // Calculate stats based on filtered data
  const totalOrders = filteredOrders.length;
  const totalBottles = filteredOrders.reduce(
    (sum, order) => sum + (order.total_bottles || 0),
    0
  );
  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "pending"
  ).length;

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
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Party Orders
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Bulk orders for events
                  </p>
                </div>
                {/* Add Button for all screen sizes */}
                <AddPartyOrder onSuccess={handleSuccess} />
              </div>
            </div>

            <TooltipProvider>
              <div className="px-4 pt-4 sm:px-6 sm:pt-6">
                {/* Stats Cards - Mobile Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {/* Total Orders */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                          <p className="text-[10px] sm:text-xs font-medium">
                            Total
                          </p>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold tracking-tight text-blue-600">
                          {isLoading ? <Skeleton width={40} /> : totalOrders}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Bottles */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          <p className="text-[10px] sm:text-xs font-medium">
                            Bottles
                          </p>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold tracking-tight text-green-600">
                          {isLoading ? <Skeleton width={40} /> : totalBottles}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Orders */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 sm:p-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <p className="text-[10px] sm:text-xs font-medium">
                            Pending
                          </p>
                        </div>
                        <p className="text-xl sm:text-3xl font-bold tracking-tight text-orange-600">
                          {isLoading ? <Skeleton width={40} /> : pendingOrders}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Orders Table */}
                <Tabs defaultValue="all">
                  <TabsContent value="all" className="mt-0">
                    <Card className="overflow-hidden">
                      <CardHeader className="border-b bg-muted/50 px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base sm:text-lg font-semibold">
                              All Orders
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-0.5">
                              {totalOrders}{" "}
                              {totalOrders === 1 ? "order" : "orders"} found
                            </CardDescription>
                          </div>
                          {totalOrders > 0 && (
                            <Badge
                              variant="secondary"
                              className="hidden sm:inline-flex"
                            >
                              {totalOrders}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {isLoading ? (
                          <div className="p-4 sm:p-6">
                            <Skeleton
                              className="h-[300px]"
                              enableAnimation={true}
                            />
                          </div>
                        ) : (ordersData?.data || []).length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                              No party orders yet
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-sm mb-4">
                              Start by creating your first bulk order for marriages, functions, or parties
                            </p>
                            <AddPartyOrder onSuccess={handleSuccess} />
                          </div>
                        ) : (
                          <div className="p-3 sm:p-6">
                            <DataTable
                              data={filteredOrders}
                              columns={partyOrderColumns}
                              filterColumn="party_name"
                              filterPlaceholder="Search party name..."
                              dateFilter={dateFilter}
                              customDate={customDate}
                              showCalendar={showCalendar}
                              setShowCalendar={setShowCalendar}
                              handleDateFilterChange={handleDateFilterChange}
                              resetFilters={resetFilters}
                              setCustomDate={setCustomDate}
                              meta={{
                                onPreview: handlePreview,
                                onEdit: handleEdit,
                                onSend: handleSend,
                                onDelete: handleDelete,
                              }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Invoice Preview/Send Dialog */}
        {showInvoice && selectedOrder && (
          <PartyOrderInvoice
            order={selectedOrder}
            open={showInvoice}
            onClose={() => {
              setShowInvoice(false);
              setSelectedOrder(null);
            }}
            onSuccess={() => {
              refetch();
              setShowInvoice(false);
              setSelectedOrder(null);
            }}
          />
        )}

        {/* Edit Dialog */}
        {showEdit && selectedOrder && (
          <EditPartyOrder
            order={selectedOrder}
            open={showEdit}
            onClose={() => {
              setShowEdit(false);
              setSelectedOrder(null);
            }}
            onSuccess={() => {
              refetch();
              setShowEdit(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </SkeletonTheme>
    </>
  );
};

export default PartyOrders;
