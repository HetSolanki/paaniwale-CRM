import { Badge } from "@/Components/UI/shadcn-UI/badge";
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
import { format } from "date-fns";

export type Customer = {
  _id: string;
  bottle_count: number;
  delivery_date: string;
  delivery_status: string;
  cid: string;
};

export const columns1: ColumnDef<Customer>[] = [
  {
    accessorKey: "delivery_date",
    header: () => <div className="text-left">Delivery Date</div>,
    cell: ({ row }) => (
      <div className="font-medium">
        {format(new Date(row.getValue("delivery_date")), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "bottle_count",
    header: () => <div className="text-left">Bottles</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("bottle_count") || 0}</div>
    ),
  },
  {
    accessorKey: "delivery_status",
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => (
      <>
        {row.getValue("delivery_status") === "Present" ? (
          <Badge variant="default" className="text-xs">Present</Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">Absent</Badge>
        )}
      </>
    ),
  },
];
