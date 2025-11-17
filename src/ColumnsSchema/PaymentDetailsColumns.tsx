import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ClipboardCheckIcon, Wallet, CreditCard, Banknote, Building2, MoreHorizontal } from "lucide-react";
import { Button } from "../Components/UI/shadcn-UI/button";
import { Badge } from "../Components/UI/shadcn-UI/badge";
import { toast } from "react-toastify";
import React from "react";
import { PendingActions } from "@mui/icons-material";
import { addpaymententry } from "@/Handlers/AddPaymentEntry";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";

export type Customer = {
  _id: string;
  uid: string;
  cname: string;
  caddress: string;
  cphone_number: string;
  totalamount: number;
};

const handleEntry = async (
  customer: Customer,
  status: string,
  totalamount: number,
  paymentMode: string,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  if (status === "Received") {
    const newEntry = await addpaymententry(
      {
        amount: totalamount,
        payment_status: "completed",
        payment_date: new Date(),
        payment_method: paymentMode,
      },
      customer._id
    );
    if (newEntry.status === "success") {
      toast.success(`Payment Received via ${paymentMode.toUpperCase()}`, {
        autoClose: 1000,
      });
      // Invalidate all payment-related queries to refresh both pending and received sections
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["paymentdetails"] });
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      setCustomers((prev) => prev.filter((c) => c.uid !== customer.uid));
    } else {
      toast.error("Error on Receive", {
        autoClose: 1000,
      });
    }
  }

  if (status === "Pending") {
    const newEntry = await addpaymententry(
      {
        amount: totalamount,
        payment_status: "pending",
        payment_date: new Date(),
        payment_method: paymentMode,
      },
      customer._id
    );
    if (newEntry.status === "success") {
      toast.info("Payment in Pending", {
        autoClose: 1000,
      });
      // Invalidate all payment-related queries to refresh both pending and received sections
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["paymentdetails"] });
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      setCustomers((prev) => prev.filter((c) => c.uid !== customer.uid));
    } else {
      toast.error("Error in Pending", {
        autoClose: 1000,
      });
    }
  }
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <div className="text-left hidden sm:table-cell">
          <Button
            variant="ghost"
            className="px-0 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sr
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-left hidden sm:table-cell">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "cname",
    header: () => <div className="text-left font-semibold">Customer</div>,
    cell: ({ row }) => (
      <div className="text-left">
        <div className="capitalize font-medium">{row.getValue("cname")}</div>
        {/* Show address on mobile as subtitle */}
        <div className="text-xs text-muted-foreground mt-0.5 sm:hidden line-clamp-1">
          {row.original.caddress}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "caddress",
    header: () => <div className="text-left hidden sm:table-cell font-semibold">Address</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left hidden sm:table-cell">{row.getValue("caddress")}</div>
      );
    },
  },
  {
    accessorKey: "cphone_number",
    header: () => <div className="text-left hidden sm:table-cell font-semibold">Phone</div>,
    cell: ({ row }) => (
      <div className="text-left hidden sm:table-cell">{row.getValue("cphone_number")}</div>
    ),
  },
  {
    accessorKey: "totalamount",
    header: () => <div className="text-left font-semibold">Amount</div>,
    cell: ({ row }) => (
      <div className="text-left font-semibold whitespace-nowrap">₹{row.getValue("totalamount")}</div>
    ),
  },

  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const [customers, setCustomers] = React.useState<Customer[]>([]);
      const [paymentMode, setPaymentMode] = React.useState("cash");
      const queryClient = useQueryClient();
      const customer = row.original;

      return (
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center min-w-[140px] sm:min-w-0">
          <Select value={paymentMode} onValueChange={setPaymentMode}>
            <SelectTrigger className="w-full sm:w-[110px] h-8 text-xs">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">
                <div className="flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Cash</span>
                </div>
              </SelectItem>
              <SelectItem value="upi">
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>UPI</span>
                </div>
              </SelectItem>
              <SelectItem value="card">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Card</span>
                </div>
              </SelectItem>
              <SelectItem value="netbanking">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Net Banking</span>
                </div>
              </SelectItem>
              <SelectItem value="bank_transfer">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Bank Transfer</span>
                </div>
              </SelectItem>
              <SelectItem value="other">
                <div className="flex items-center gap-1.5">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span>Other</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-initial"
              title="Mark as Received"
              onClick={() =>
                handleEntry(
                  customer,
                  "Received",
                  row.original.totalamount,
                  paymentMode,
                  setCustomers,
                  queryClient
                )
              }
            >
              <ClipboardCheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Received</span>
              <span className="sm:hidden text-xs">Rcvd</span>
            </Button>
            <Button
              size="sm"
              title="Mark as Pending"
              variant="outline"
              className="h-8 gap-1 border-orange-300 text-orange-600 hover:bg-orange-50 flex-1 sm:flex-initial"
              onClick={() => {
                handleEntry(
                  customer,
                  "Pending",
                  row.original.totalamount,
                  paymentMode,
                  setCustomers,
                  queryClient
                );
              }}
            >
              <PendingActions className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden text-xs">Pend</span>
            </Button>
          </div>
        </div>
      );
    },
  },
];
