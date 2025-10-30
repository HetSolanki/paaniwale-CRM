import { Badge } from "@/Components/UI/shadcn-UI/badge";
import {
    Wallet,
    CreditCard,
    Banknote,
    Building2,
    MoreHorizontal,
    CheckCircle2,
    Clock,
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

export type Customer = {
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
        cell: ({ row }) => (
            <>
                {row.getValue("payment_status") === "Received" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Received
                    </Badge>
                ) : (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )}
            </>
        ),
    },
];
