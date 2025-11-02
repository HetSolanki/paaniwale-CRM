"use client";

import * as React from "react";
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
import { Input } from "../UI/shadcn-UI/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../UI/shadcn-UI/table";
import './customerdatatable.css';
import { Button } from "../UI/shadcn-UI/button";

interface DataTableProps {
  data: any[];
  columns: ColumnDef<any>[];
}

export function DataTable({ data, columns }: DataTableProps) {
  // State for table features
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Initialize table with configuration
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Event handlers for table state changes
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    // Feature models
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Handle responsive column visibility
  React.useEffect(() => {
    const handleResponsiveColumns = () => {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // On mobile, show only name (with address below) and actions
        setColumnVisibility({
          delivery_sequence_number: false,
          cname: true,
          cphone_number: false,
          caddress: false,
          bottle_price: false,
          actions: true,
        });
      } else {
        // On desktop, show all columns
        setColumnVisibility({
          delivery_sequence_number: true,
          cname: true,
          cphone_number: true,
          caddress: true,
          bottle_price: true,
          actions: true,
        });
      }
    };

    // Set initial visibility and listen for window resizes
    handleResponsiveColumns();
    window.addEventListener("resize", handleResponsiveColumns);

    return () => window.removeEventListener("resize", handleResponsiveColumns);
  }, []);

  return (
    <div className="w-full">
      {/* Search Filter */}
      <div className="flex items-center py-3 sm:py-4">
        <Input
          placeholder="Search customers by name..."
          value={(table.getColumn("cname")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("cname")?.setFilterValue(event.target.value)
          }
          className="max-w-full sm:max-w-sm"
        />
      </div>

      {/* Main Table */}
      <div className="rounded-md border">
        <Table>
          {/* Table Header */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs sm:text-sm">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/* Table Body */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
        <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
          {table.getRowModel().rows?.length > 0 ? (
            <>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()} ({table.getRowModel().rows.length} customers)
            </>
          ) : (
            "No customers"
          )}
        </div>
        <div className="flex space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
