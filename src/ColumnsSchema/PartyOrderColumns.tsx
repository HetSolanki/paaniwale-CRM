import { MoreHorizontal, Pencil, Trash2, Send, FileText } from "lucide-react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/UI/shadcn-UI/dropdown-menu";
import { Badge } from "@/Components/UI/shadcn-UI/badge";

const getStatusVariant = (status) => {
    switch (status) {
        case "Confirmed":
            return "default";
        case "Delivered":
            return "secondary";
        case "Cancelled":
            return "destructive";
        default:
            return "outline";
    }
};

export const partyOrderColumns = [
    {
        accessorKey: "party_name",
        header: "Party Name",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("party_name")}</span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.event_type}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "party_phone",
        header: "Phone",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2">
                    <span>{row.getValue("party_phone")}</span>
                    {row.original.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                            ✓
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "delivery_date",
        header: "Delivery Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("delivery_date"));
            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        },
    },
    {
        accessorKey: "bottles",
        header: "Bottles",
        cell: ({ row }) => {
            const coldQty = row.original.cold_bottle_quantity || 0;
            const normalQty = row.original.normal_bottle_quantity || 0;
            return (
                <div className="flex flex-col text-sm">
                    {coldQty > 0 && (
                        <span className="text-blue-600">❄️ Cold: {coldQty}</span>
                    )}
                    {normalQty > 0 && (
                        <span className="text-orange-600">🌡️ Normal: {normalQty}</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "total_amount",
        header: "Amount",
        cell: ({ row }) => {
            return (
                <span className="font-semibold">₹{row.getValue("total_amount")}</span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
        },
    },
    {
        accessorKey: "invoice_sent",
        header: "Invoice",
        cell: ({ row }) => {
            return row.getValue("invoice_sent") ? (
                <Badge variant="secondary">Sent</Badge>
            ) : (
                <Badge variant="outline">Not Sent</Badge>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) => {
            const order = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => table.options.meta?.onPreview(order)}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Preview Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.options.meta?.onEdit(order)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.options.meta?.onSend(order)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => table.options.meta?.onDelete(order)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
