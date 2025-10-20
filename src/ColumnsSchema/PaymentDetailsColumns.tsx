import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ClipboardCheckIcon } from "lucide-react";
import { Button } from "../Components/UI/shadcn-UI/button";
import { toast } from "react-toastify";
import React from "react";
import { PendingActions } from "@mui/icons-material";
import { addpaymententry } from "@/Handlers/AddPaymentEntry";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";

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
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  if (status === "Received") {
    const newEntry = await addpaymententry(
      {
        amount: totalamount,
        payment_status: "Received",
        payment_date: new Date(),
      },
      customer._id
    );
    if (newEntry.status === "success") {
      toast.success("Payment Received", {
        autoClose: 1000,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
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
        payment_status: "Pending",
        payment_date: new Date(),
      },
      customer._id
    );
    if (newEntry.status === "success") {
      toast.info("Payment in Pending", {
        autoClose: 1000,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
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
        <div className="text-left">
          <Button
            variant="ghost"
            className="px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sr
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase text-left">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "cname",
    header: () => <div className="text-left">Customer Name</div>,
    cell: ({ row }) => (
      <div className="capitalize text-left">{row.getValue("cname")}</div>
    ),
  },
  {
    accessorKey: "caddress",
    header: () => <div className="text-left">Address</div>,
    cell: ({ row }) => {
      return (
        <div className="lowercase text-left">{row.getValue("caddress")}</div>
      );
    },
  },
  {
    accessorKey: "cphone_number",
    header: () => <div className="text-left">Phone Number</div>,
    cell: ({ row }) => (
      <div className="lowercase text-left">{row.getValue("cphone_number")}</div>
    ),
  },
  {
    accessorKey: "totalamount",
    header: () => <div className="text-left">Total Amount</div>,
    cell: ({ row }) => (
      <div className="lowercase text-left">{row.getValue("totalamount")}</div>
    ),
  },

  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const [customers, setCustomers] = React.useState<Customer[]>([]);
      const queryClient = useQueryClient();
      const customer = row.original;
      const ResponsiveStack = styled.div`
        display: flex;
        flex-direction: row;
        gap: 8px;

        @media (max-width: 600px) {
          flex-direction: column;
          margin-left: -10px;
        }
      `;
      return (
        <>
          <ResponsiveStack>
            <Button
              size="icon"
              className="h-8 gap-1 inl"
              title="Received"
              onClick={() =>
                handleEntry(
                  customer,
                  "Received",
                  row.original.totalamount,
                  setCustomers,
                  queryClient
                )
              }
            >
              <ClipboardCheckIcon />
            </Button>
            <Button
              size="icon"
              title="Pending"
              className="h-8 gap-1"
              onClick={() => {
                handleEntry(
                  customer,
                  "Pending",
                  row.original.totalamount,
                  setCustomers,
                  queryClient
                );
              }}
            >
              <PendingActions />
            </Button>
          </ResponsiveStack>
        </>
      );
    },
  },
];
