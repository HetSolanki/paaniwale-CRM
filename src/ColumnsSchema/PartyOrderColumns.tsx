import { MoreHorizontal, Pencil, Trash2, Send, FileText, Eye, X } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/Components/UI/shadcn-UI/dialog";
import { useState } from "react";

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

const PartyDetailsDialog = ({ order }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Party Order Details</DialogTitle>
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </DialogClose>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Party Info */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Party Information</h3>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Name:</span>
                                <span className="text-sm font-medium">{order.party_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Phone:</span>
                                <span className="text-sm font-medium">{order.party_phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Event Type:</span>
                                <span className="text-sm font-medium">{order.event_type}</span>
                            </div>
                            {order.party_address && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-muted-foreground">Address:</span>
                                    <span className="text-sm font-medium">{order.party_address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-2 border-t pt-3">
                        <h3 className="font-semibold text-sm text-muted-foreground">Delivery Information</h3>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Delivery Date:</span>
                                <span className="text-sm font-medium">
                                    {new Date(order.delivery_date).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <Badge variant={getStatusVariant(order.status)} className="text-xs">
                                    {order.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Bottle Details */}
                    <div className="space-y-2 border-t pt-3">
                        <h3 className="font-semibold text-sm text-muted-foreground">Bottle Details</h3>
                        <div className="space-y-2">
                            {order.cold_bottle_quantity > 0 && (
                                <div className="bg-blue-50 p-2 rounded">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-blue-700">Cold Bottles</span>
                                        <span className="text-sm font-semibold text-blue-700">
                                            {order.cold_bottle_quantity} × ₹{order.cold_bottle_price}
                                        </span>
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        Total: ₹{order.cold_bottle_quantity * order.cold_bottle_price}
                                    </div>
                                </div>
                            )}
                            {order.normal_bottle_quantity > 0 && (
                                <div className="bg-orange-50 p-2 rounded">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-orange-700">Normal Bottles</span>
                                        <span className="text-sm font-semibold text-orange-700">
                                            {order.normal_bottle_quantity} × ₹{order.normal_bottle_price}
                                        </span>
                                    </div>
                                    <div className="text-xs text-orange-600 mt-1">
                                        Total: ₹{order.normal_bottle_quantity * order.normal_bottle_price}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="space-y-2 border-t pt-3">
                        <div className="flex justify-between items-center bg-green-50 p-3 rounded">
                            <span className="text-sm font-semibold text-green-700">Grand Total:</span>
                            <span className="text-lg font-bold text-green-700">₹{order.total_amount}</span>
                        </div>
                    </div>

                    {/* Invoice Status */}
                    <div className="space-y-2 border-t pt-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Invoice:</span>
                            {order.invoice_sent ? (
                                <Badge variant="secondary" className="text-xs">Sent</Badge>
                            ) : (
                                <Badge variant="outline" className="text-xs">Not Sent</Badge>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="space-y-2 border-t pt-3">
                            <h3 className="font-semibold text-sm text-muted-foreground">Notes</h3>
                            <p className="text-sm bg-yellow-50 p-2 rounded">{order.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const partyOrderColumns = [
    {
        accessorKey: "party_name",
        header: "Party Name",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col min-w-[50px] lg:min-w-[200px]">
                    <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                        {row.getValue("party_name")}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
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
                <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="text-sm sm:text-base whitespace-nowrap">
                        {row.getValue("party_phone")}
                    </span>
                    {row.original.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                            ✓
                        </Badge>
                    )}
                </div>
            );
        },
        enableHiding: true,
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "delivery_date",
        header: "Delivery Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("delivery_date"));
            return (
                <span className="text-sm sm:text-base whitespace-nowrap">
                    {date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            );
        },
        enableHiding: true,
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "bottles",
        header: "Bottles",
        cell: ({ row }) => {
            const coldQty = row.original.cold_bottle_quantity || 0;
            const normalQty = row.original.normal_bottle_quantity || 0;
            return (
                <div className="flex flex-col text-xs sm:text-sm min-w-[100px]">
                    {coldQty > 0 && (
                        <span className="text-blue-600 whitespace-nowrap">
                            ❄️ Cold: {coldQty}
                        </span>
                    )}
                    {normalQty > 0 && (
                        <span className="text-orange-600 whitespace-nowrap">
                            🌡️ Normal: {normalQty}
                        </span>
                    )}
                </div>
            );
        },
        enableHiding: true,
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "total_amount",
        header: "Amount",
        cell: ({ row }) => {
            return (
                <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                    ₹{row.getValue("total_amount")}
                </span>
            );
        },
        enableHiding: true,
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            return (
                <Badge variant={getStatusVariant(status)} className="text-xs sm:text-sm whitespace-nowrap">
                    {status}
                </Badge>
            );
        },
        enableHiding: true,
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "invoice_sent",
        header: "Invoice",
        cell: ({ row }) => {
            return row.getValue("invoice_sent") ? (
                <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
                    Sent
                </Badge>
            ) : (
                <Badge variant="outline" className="text-xs sm:text-sm whitespace-nowrap">
                    Not Sent
                </Badge>
            );
        },
        enableHiding: true,
        meta: {
            className: "hidden lg:table-cell",
        },
    },
    {
        accessorKey: "view",
        header: "View",
        cell: ({ row }) => {
            return <PartyDetailsDialog order={row.original} />;
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
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel className="text-xs sm:text-sm">
                            Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => table.options.meta?.onPreview(order)}
                            className="text-xs sm:text-sm"
                        >
                            <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Preview Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => table.options.meta?.onEdit(order)}
                            className="text-xs sm:text-sm"
                        >
                            <Pencil className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => table.options.meta?.onSend(order)}
                            className="text-xs sm:text-sm"
                        >
                            <Send className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Send Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => table.options.meta?.onDelete(order)}
                            className="text-red-600 text-xs sm:text-sm"
                        >
                            <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
