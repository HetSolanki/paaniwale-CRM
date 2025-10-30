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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Filter, CalendarDays, X } from "lucide-react";

import { Button } from "../shadcn-UI/button";
import { Checkbox } from "../shadcn-UI/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../shadcn-UI/dropdown-menu";
import { Input } from "../shadcn-UI/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../shadcn-UI/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../shadcn-UI/popover";
import { Calendar as CalendarIcon } from "../shadcn-UI/calendar";
import { Badge } from "../shadcn-UI/badge";
import { format } from "date-fns";

export function DataTable({
  data,
  columns,
  meta,
  filterColumn = "cname",
  filterPlaceholder = "Filter...",
  dateFilter,
  customDate,
  showCalendar,
  setShowCalendar,
  handleDateFilterChange,
  resetFilters,
  setCustomDate
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    meta,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-sm sm:text-base"
        />

        {/* Date Filter Section */}
        {dateFilter !== undefined && (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              {/* <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" /> */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[180px] justify-start text-sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {dateFilter === "all"
                      ? "All Orders"
                      : dateFilter === "today"
                        ? "Today"
                        : dateFilter === "yesterday"
                          ? "Yesterday"
                          : dateFilter === "last7days"
                            ? "Last 7 Days"
                            : dateFilter === "thisMonth"
                              ? "This Month"
                              : dateFilter === "thisYear"
                                ? "This Year"
                                : "Custom Date"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[180px]">
                  <DropdownMenuRadioGroup value={dateFilter} onValueChange={handleDateFilterChange}>
                    <DropdownMenuRadioItem value="all">
                      All Orders
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="today">
                      Today
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="yesterday">
                      Yesterday
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="last7days">
                      Last 7 Days
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="thisMonth">
                      This Month
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="thisYear">
                      This Year
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="custom">
                      Custom Date
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {dateFilter === "custom" && (
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto justify-start text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {customDate ? (
                        <span className="hidden sm:inline">{format(customDate, "PPP")}</span>
                      ) : (
                        <span>Pick date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarIcon
                      mode="single"
                      selected={customDate}
                      onSelect={(date) => {
                        setCustomDate(date);
                        setShowCalendar(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              {dateFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFilters}
                  className="h-9 w-9 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Active Filter Badge */}
            {dateFilter !== "all" && (
              <Badge variant="secondary" className="w-fit text-xs">
                {dateFilter === "custom" && customDate
                  ? `Date: ${format(customDate, "PP")}`
                  : dateFilter === "today"
                    ? "Today"
                    : dateFilter === "yesterday"
                      ? "Yesterday"
                      : dateFilter === "last7days"
                        ? "Last 7 Days"
                        : dateFilter === "thisMonth"
                          ? "This Month"
                          : "This Year"}
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full lg:min-w-[800px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnMeta = header.column.columnDef.meta as { className?: string } | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      className={`text-xs sm:text-sm ${columnMeta?.className || ''}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnMeta = cell.column.columnDef.meta as { className?: string } | undefined;
                    return (
                      <TableCell
                        key={cell.id}
                        className={`text-xs sm:text-sm ${columnMeta?.className || ''}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="text-xs sm:text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-xs sm:text-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
