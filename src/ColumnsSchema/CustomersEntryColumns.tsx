import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, X, Plus, Minus } from "lucide-react";
import { Button } from "../Components/UI/shadcn-UI/button";
import { addcustomerEntry } from "../Handlers/AddcustomerEntryHandler";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { toast, ToastContainer } from "react-toastify";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/Components/UI/shadcn-UI/badge";

export type Customer = {
  cname: string;
  cphone_number: number;
  caddress: string;
  bottle_price: number;
  uid: string;
  no_of_bottle: number;
  delivery_sequence_number: number;
};

const handleEntry = async (
  customer: Customer,
  status: string,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  const no_of_bottles = document.getElementById(customer._id);

  if (status === "Present") {
    if (no_of_bottles.value !== "") {
      if (parseInt(no_of_bottles.value) > 0) {
        const newEntry = await addcustomerEntry(
          {
            no_of_bottles: parseInt(no_of_bottles.value),
            delivery_status: "Present",
          },
          customer._id
        );

        if (newEntry.status === "success") {
          toast.success("Entry added successfully", {
            autoClose: 1000,
          });
          queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
          queryClient.invalidateQueries({ queryKey: ["paymentdetails"] });
          queryClient.invalidateQueries({ queryKey: ["customersEntries"] });
          queryClient.invalidateQueries({
            queryKey: ["allCustomerEntries", customer._id],
          });

          window.dispatchEvent(new CustomEvent("customerEntryAdded"));
          setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
        } else {
          toast.error("Entry could not be added", {
            autoClose: 1000,
          });
        }
      } else {
        toast.error("Please enter a valid quantity", {
          autoClose: 1000,
        });
        no_of_bottles.value = 0;
      }
    } else {
      toast.error("Please enter the quantity", {
        autoClose: 1000,
      });
      no_of_bottles.value = 0;
    }
  }

  if (status === "Absent") {
    const newEntry = await addcustomerEntry(
      {
        no_of_bottles: 0,
        delivery_status: "Absent",
      },
      customer._id
    );
    if (newEntry.status === "success") {
      toast.success("Entry added successfully", {
        autoClose: 1000,
      });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["paymentdetails"] });
      queryClient.invalidateQueries({ queryKey: ["customersEntries"] });

      window.dispatchEvent(new CustomEvent("customerEntryAdded"));
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
    } else {
      toast.error("Entry could not be added", {
        autoClose: 1000,
      });
    }
  }
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "delivery_sequence_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-1 sm:px-2 hover:bg-transparent hidden sm:flex"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className="ml-1 sm:ml-1.5 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="font-mono text-xs hidden sm:inline-flex"
      >
        {row.getValue("delivery_sequence_number")}
      </Badge>
    ),
  },

  {
    accessorKey: "cname",
    header: () => (
      <div className="text-left font-semibold text-xs sm:text-sm">Customer</div>
    ),
    cell: ({ row }) => (
      <div className="min-w-0 max-w-[120px] sm:max-w-none">
        <div className="font-medium text-xs sm:text-base truncate">
          {row.getValue("cname")}
        </div>
        {/* Show address on mobile beneath name */}
        <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:hidden line-clamp-1">
          {row.original.caddress}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "caddress",
    header: () => (
      <div className="text-left font-semibold hidden sm:table-cell">
        Address
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-sm max-w-[200px] truncate hidden sm:table-cell">
          {row.getValue("caddress")}
        </div>
      );
    },
  },

  {
    accessorKey: "bottle_price",
    header: () => (
      <div className="text-left font-semibold hidden sm:table-cell">Price</div>
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono hidden sm:inline-flex">
          ₹{row.getValue("bottle_price")}
        </Badge>
      );
    },
  },

  {
    header: () => {
      return (
        <div className="text-center font-semibold text-xs sm:text-sm">Qty</div>
      );
    },
    accessorKey: "no_of_bottle",
    id: "no_of_bottle",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center justify-center gap-0.5 sm:gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-8 sm:w-8 rounded-full shrink-0 active:scale-95 transition-transform"
            onClick={() => {
              const no_of_bottles = document.getElementById(customer._id);
              if (no_of_bottles.value === "") {
                no_of_bottles.value = 0;
              }
              no_of_bottles.value = Math.max(
                0,
                parseInt(no_of_bottles.value) - 1
              );
            }}
          >
            <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>

          <Input
            id={customer._id}
            className="w-10 sm:w-14 h-8 sm:h-8 text-center font-bold text-sm sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            type="number"
            step={1}
            defaultValue={0}
            inputMode="numeric"
          />

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-8 sm:w-8 rounded-full shrink-0 active:scale-95 transition-transform"
            onClick={() => {
              const no_of_bottles = document.getElementById(customer._id);
              if (no_of_bottles.value === "") {
                no_of_bottles.value = 0;
              }
              no_of_bottles.value = parseInt(no_of_bottles.value) + 1;
            }}
          >
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <ToastContainer />
        </div>
      );
    },
  },

  {
    header: () => (
      <div className="text-center font-semibold text-xs sm:text-sm">Action</div>
    ),
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const [customers, setCustomers] = React.useState<Customer[]>([]);
      const queryClient = useQueryClient();
      const customer = row.original;

      return (
        <div className="flex flex-row items-center justify-center gap-1">
          <Button
            size="icon"
            variant="default"
            className="h-8 w-8 sm:h-8 sm:w-8 bg-green-600 hover:bg-green-700 active:scale-95 transition-transform"
            onClick={() =>
              handleEntry(customer, "Present", setCustomers, queryClient)
            }
            title="Mark as Present"
          >
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 sm:h-8 sm:w-8 active:scale-95 transition-transform"
            onClick={() => {
              handleEntry(customer, "Absent", setCustomers, queryClient);
            }}
            title="Mark as Absent"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      );
    },
  },
];
