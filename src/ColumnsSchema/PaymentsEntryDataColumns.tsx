import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import {
    Wallet,
    CreditCard,
    Banknote,
    Building2,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    Edit,
} from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { config } from "@/Data/config";

export type Customer = {
    _id: string;
    cid: string;
    cname: string;
    payment_date: string;
    amount: number;
    payment_status: string;
    payment_method?: string;
};

const getPaymentModeIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
        case "cash":
            return <Banknote className="h-3.5 w-3.5" />;
        case "upi":
            return <Wallet className="h-3.5 w-3.5" />;
        case "card":
            return <CreditCard className="h-3.5 w-3.5" />;
        case "netbanking":
        case "bank_transfer":
            return <Building2 className="h-3.5 w-3.5" />;
        default:
            return <MoreHorizontal className="h-3.5 w-3.5" />;
    }
};

const formatPaymentMode = (mode: string) => {
    if (!mode) return "Cash";
    return mode
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export const columns1: ColumnDef<Customer>[] = [
    {
        accessorKey: "cid",
        header: () => <div className="text-left">Customer Name</div>,
        cell: ({ row }) => {
            const cid = row.getValue("cid") as { cname: string };
            return <div className="capitalize">{cid?.cname}</div>;
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-left">Total Amount</div>,
        cell: ({ row }) => (
            <div className="font-medium">₹{row.getValue("amount")}</div>
        ),
    },
    {
        accessorKey: "payment_date",
        header: () => <div className="text-left">Payment Date</div>,
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("payment_date")}</div>
        ),
    },
    {
        accessorKey: "payment_method",
        header: () => <div className="text-left">Payment Mode</div>,
        cell: ({ row }) => {
            const mode = row.original.payment_method || "cash";
            return (
                <div className="flex items-center gap-1.5">
                    {getPaymentModeIcon(mode)}
                    <span className="text-sm">{formatPaymentMode(mode)}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "payment_status",
        header: () => <div className="text-left">Payment Status</div>,
        cell: ({ row }) => {
            const [isEditing, setIsEditing] = React.useState(false);
            const [newStatus, setNewStatus] = React.useState(row.getValue("payment_status"));
            const queryClient = useQueryClient();

            const handleStatusUpdate = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(
                        `${config.baseUrl}/api/paymentdetails/updatepaymentdetails/${row.original._id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                authorization: "Bearer " + token,
                            },
                            body: JSON.stringify({
                                payment_status: newStatus,
                            }),
                        }
                    );

                    const result = await response.json();

                    if (result.status === "success") {
                        toast.success("Payment status updated successfully", {
                            autoClose: 1000,
                        });
                        // Invalidate all payment-related queries
                        queryClient.invalidateQueries({ queryKey: ["allPayments"] });
                        queryClient.invalidateQueries({ queryKey: ["paymentdetails"] });
                        queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
                        setIsEditing(false);
                    } else {
                        toast.error(result.message || "Failed to update status", {
                            autoClose: 2000,
                        });
                    }
                } catch (error) {
                    console.error("Error updating payment status:", error);
                    toast.error("Error updating payment status", {
                        autoClose: 2000,
                    });
                }
            };

            if (isEditing) {
                return (
                    <div className="flex items-center gap-2">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Pending
                                    </div>
                                </SelectItem>
                                <SelectItem value="Received">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Received
                                    </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Completed
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            onClick={handleStatusUpdate}
                            className="h-8 px-2"
                        >
                            Save
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setNewStatus(row.getValue("payment_status"));
                                setIsEditing(false);
                            }}
                            className="h-8 px-2"
                        >
                            Cancel
                        </Button>
                    </div>
                );
            }

            return (
                <div className="flex items-center gap-2">
                    {row.getValue("payment_status") === "Received" || row.getValue("payment_status") === "completed" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {row.getValue("payment_status")}
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                        </Badge>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-7 w-7 p-0"
                        title="Edit status"
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                </div>
            );
        },
    },
];
