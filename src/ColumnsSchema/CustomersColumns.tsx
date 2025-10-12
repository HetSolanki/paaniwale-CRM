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
import { ArrowUpDown } from "lucide-react";
import { Button } from "../Components/UI/shadcn-UI/button";
import { Editcustomer } from "@/Components/UI/UI-Components/Editcustomer";
import DeleteCustomer from "@/Components/UI/UI-Components/DeleteCustomer";
import GetInvoice from "@/Components/UI/UI-Components/GetInvoice";

// Define the Customer type interface for better type safety
export interface Customer {
  _id: number;
  id: number;
  cname: string;
  cphone_number: number;
  caddress: string;
  bottle_price: number;
  delivery_sequence_number: number;
  uid: {
    fname: string;
  };
}

// Define table columns configuration
export const columns: ColumnDef<Customer>[] = [
  // Delivery Sequence Number Column
  {
    accessorKey: "delivery_sequence_number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 text-center sm:text-left"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sequence <br />
        Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="lowercase text-left">
        {row.getValue("delivery_sequence_number")}
      </span>
    ),
  },

  // Customer Name Column
  {
    accessorKey: "cname",
    header: () => (
      <span className="text-center sm:text-left">Customer Names</span>
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("cname")}</span>
    ),
  },

  // Phone Number Column
  {
    accessorKey: "cphone_number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 text-center sm:text-left w-10"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Phone <br /> Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="capitalize text-left">
        {row.getValue("cphone_number")}
      </span>
    ),
  },

  // Address Column
  {
    accessorKey: "caddress",
    header: () => <span className="text-center sm:text-left">Address</span>,
    cell: ({ row }) => (
      <span className="lowercase text-left">{row.getValue("caddress")}</span>
    ),
  },

  // Bottle Price Column
  {
    accessorKey: "bottle_price",
    header: () => <span>Bottle Price</span>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("bottle_price"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      return <span className="font-medium">{formatted}</span>;
    },
  },

  // Actions Column
  {
    header: () => <span className="text-center sm:text-left">Actions</span>,
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <span className="flex gap-x-2">
          <Editcustomer id={customer._id} />
          <DeleteCustomer cid={customer._id} />
          <GetInvoice cid={customer._id} />
        </span>
      );
    },
  },
];
