import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { Button } from "@/Components/UI/shadcn-UI/button";
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

const PartyOrders = () => {
  const { theme } = useTheme();
  const { toast } = useToast();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Fetch party orders
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["partyOrders"],
    queryFn: getPartyOrders,
    enabled: !!localStorage.getItem("token"),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

  return (
    <>
      <SkeletonTheme
        baseColor={theme === "dark" ? "#1c1c1c" : ""}
        highlightColor={theme === "dark" ? "#525252" : ""}
      >
        <Navbar />
        <div className="flex min-h-screen mx-auto flex-col bg-muted/40">
          <TooltipProvider>
            <div className="flex flex-col sm:gap-4 sm:py-4">
              <main className="grid flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8">
                <Tabs defaultValue="all">
                  <TabsContent value="all">
                    <Card>
                      {isLoading ? (
                        <div className="mt-4 py-3 px-4">
                          <Skeleton
                            className="h-[90px]"
                            enableAnimation={true}
                          />
                        </div>
                      ) : error ? (
                        <CardHeader className="px-2 sm:px-4">
                          <CardTitle className="text-xl sm:text-2xl text-red-500">
                            Error Loading Party Orders
                          </CardTitle>
                          <CardDescription className="text-red-400">
                            {error?.message || "Failed to load party orders"}.
                            Please check your connection and try again.
                          </CardDescription>
                          <div className="flex gap-2 mt-2">
                            <Button onClick={() => refetch()} className="w-fit">
                              Retry
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => window.location.reload()}
                              className="w-fit"
                            >
                              Refresh Page
                            </Button>
                          </div>
                        </CardHeader>
                      ) : (
                        <CardHeader className="px-2 sm:px-4">
                          <CardTitle className="flex-col pt-4 px-2 sm:flex-row sm:flex sm:items-center sm:justify-between">
                            <span className="text-xl font-semibold text-primary sm:text-2xl align-bottom">
                              Party Orders
                            </span>
                            <div className="mt-4 sm:mt-0 flex sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                              <AddPartyOrder onSuccess={handleSuccess} />
                            </div>
                          </CardTitle>
                          <CardDescription className="hidden sm:block px-2">
                            Manage bulk orders for marriages, functions, and
                            parties.
                          </CardDescription>
                        </CardHeader>
                      )}

                      <CardContent className="py-3 px-2 sm:px-4">
                        {isLoading ? (
                          <div className="mb-4">
                            <Skeleton
                              className="h-[300px]"
                              enableAnimation={true}
                            />
                          </div>
                        ) : error ? (
                          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                            <p className="text-lg font-medium">
                              Unable to load party orders
                            </p>
                            <p className="text-sm">
                              {error?.message || "An error occurred"}
                            </p>
                          </div>
                        ) : !ordersData?.data ||
                          ordersData.data.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                            <p className="text-lg font-medium">
                              No party orders yet
                            </p>
                            <p className="text-sm">
                              Create your first party order to get started
                            </p>
                          </div>
                        ) : (
                          <DataTable
                            data={ordersData.data}
                            columns={partyOrderColumns}
                            filterColumn="party_name"
                            filterPlaceholder="Search party name..."
                            meta={{
                              onPreview: handlePreview,
                              onEdit: handleEdit,
                              onSend: handleSend,
                              onDelete: handleDelete,
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </main>
            </div>
          </TooltipProvider>
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
