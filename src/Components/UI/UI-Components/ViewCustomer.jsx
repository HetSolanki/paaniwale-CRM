/* eslint-disable react/prop-types */
import { useState } from "react";
import { EyeIcon, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-UI/dialog";
import { Button } from "../shadcn-UI/button";
import { DataTable } from "@/Components/DataTables/customerviewDatatable";
import { columns1 } from "@/ColumnsSchema/CustomersEntryDataColums";
import { fetchCustomerEnteries } from "@/Hooks/fetchCustomerEnteries";
import { fetchCustomer } from "@/Hooks/fetchCustomer";
import Skeleton from "react-loading-skeleton";
import { ScrollArea } from "../shadcn-UI/scroll-area";

export default function ViewCustomer({ cid }) {
  const [customerEntry, setCustomerEntry] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenChange = async (isOpen) => {
    setOpen(isOpen);

    if (isOpen && !customer) {
      setLoading(true);
      try {
        const [customerEntryRes, customerRes] = await Promise.all([
          fetchCustomerEnteries(cid),
          fetchCustomer({ queryKey: ["", cid] }),
        ]);

        setCustomerEntry(customerEntryRes.data);
        setCustomer(customerRes.data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <EyeIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <ScrollArea className="max-h-[90vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">
                Customer Details
              </DialogTitle>
              <DialogDescription className="sr-only">
                View customer information and delivery entries
              </DialogDescription>
            </DialogHeader>

            {loading ? (
              <div className="mt-4 space-y-4">
                <Skeleton className="h-[120px] w-full" enableAnimation={true} />
                <Skeleton className="h-[300px] w-full" enableAnimation={true} />
              </div>
            ) : customer ? (
              <div className="mt-6 space-y-6">
                {/* Customer Information Card */}
                <div className="rounded-lg border bg-card p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Name
                      </p>
                      <p className="text-base font-medium capitalize">
                        {customer?.cname}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="text-base font-medium">
                        {customer?.cphone_number}
                      </p>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Address
                      </p>
                      <p className="text-base font-medium">
                        {customer?.caddress}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Bottle Price
                      </p>
                      <p className="text-base font-medium">
                        ₹{customer?.bottle_price}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Delivery Sequence
                      </p>
                      <p className="text-base font-medium">
                        {customer?.delivery_sequence_number}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Entries Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Delivery Entries</h3>
                  {customerEntry ? (
                    <div className="rounded-lg border">
                      <DataTable columns={columns1} data={customerEntry} />
                    </div>
                  ) : (
                    <div className="rounded-lg border p-8 text-center text-muted-foreground">
                      No delivery entries found
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
