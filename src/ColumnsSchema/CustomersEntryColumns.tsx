import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ClipboardCheckIcon, ClipboardXIcon } from "lucide-react";
import { Button } from "../Components/UI/shadcn-UI/button";
import { addcustomerEntry } from "../Handlers/AddcustomerEntryHandler";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { toast, ToastContainer } from "react-toastify";
import React from "react";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";

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
          
          // Dispatch custom event to refresh CustomerEntry component
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
      
      // Dispatch custom event to refresh CustomerEntry component
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
      <div className="lowercase text-left">
        {row.getValue("delivery_sequence_number")}
      </div>
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
    accessorKey: "bottle_price",
    header: () => <div className="text-left">Bottle Price</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left">
          <Input
            value={row.getValue("bottle_price")}
            className="w-20 text-center"
            disabled
          />
        </div>
      );
    },
  },
  {
    header: () => {
      return <div className="text-left pl-7">Quantity</div>;
    },
    accessorKey: "no_of_bottle",
    id: "no_of_bottle",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <>
          <div className="flex items-center justify-start space-x-1">
            <div
              className="cursor-pointer"
              onClick={() => {
                const no_of_bottles = document.getElementById(customer._id);
                if (no_of_bottles.value === "") {
                  no_of_bottles.value = 0;
                }
                no_of_bottles.value = parseInt(no_of_bottles.value) - 1;
                if (parseInt(no_of_bottles.value) < 0) {
                  no_of_bottles.value = 0;
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <Input
              id={customer._id}
              className="w-14 remove-arrow"
              type="number"
              step={1}
              defaultValue={0}
            />
            <div
              className="cursor-pointer"
              onClick={() => {
                const no_of_bottles = document.getElementById(customer._id);
                if (no_of_bottles.value === "") {
                  no_of_bottles.value = 0;
                }
                no_of_bottles.value = parseInt(no_of_bottles.value) + 1;
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <ToastContainer />
        </>
      );
    },
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
              onClick={() =>
                handleEntry(customer, "Present", setCustomers, queryClient)
              }
            >
              <ClipboardCheckIcon />
            </Button>
            <Button
              size="icon"
              className="h-8 gap-1"
              onClick={() => {
                handleEntry(customer, "Absent", setCustomers, queryClient);
              }}
            >
              <ClipboardXIcon />
            </Button>
            {/* <Button
              size="icon"
              className="h-8 gap-1"
              onClick={() => {
                alert(customer.cname);
              }}
            >
              <EyeIcon />
            </Button> */}
          </ResponsiveStack>
        </>
      );
    },
  },
];
