/* eslint-disable react/prop-types */
import { EyeIcon, File, PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetDescription,
  SheetTrigger,
  SheetTitle,
  SheetContent,
  SheetHeader,
} from "../shadcn-UI/sheet";
import { DataTable } from "@/Components/DataTables/customerviewDatatable";
import { useState } from "react";
import { columns1 } from "@/ColumnsSchema/CustomerssheetColums";
import { fetchCustomerEnteries } from "@/Hooks/fetchCustomerEnteries";
import { fetchCustomer } from "@/Hooks/fetchCustomer";
import { InvoiceX } from "@/Components/Section/Invoicex";
import Skeleton from "react-loading-skeleton";
import { Button } from "../shadcn-UI/button";
import { createPaymentLink } from "@/Handlers/CreatepaymentLinkHandler";
import { PDFDownloadLink } from "@react-pdf/renderer";

export default function GetInvoice({ cid }) {
  const [customerEntry, setCustomerEntry] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [invoicedata, setInvoicedata] = useState({
    data: null,
    total_bottles: 0,
    shorturl: "",
  });

  const sendinvoicelink = async () => {
    alert("Sending Invoice Link");
    // console.log(invoicedata);
    const cname = invoicedata.data.cname;
    const cphone_number = invoicedata.data.cphone_number;
    const amount = invoicedata.data.bottle_price * invoicedata.total_bottles;
    // console.log(amount, cname, cphone_number);
    const data = {
      amount: amount,
      description: "Payment for Bottles",
      customer_name: cname,
      customer_phone: cphone_number,
      customer_email: "",
      smsnotify: true,
      emailnotify: false,
      reminder_enable: false,
    };
    // console.log("Data to be sent");
    // console.log(data);
    const newpaymentlink = await createPaymentLink(data);

    if (newpaymentlink.status === "success") {
      alert("Payment Link Created");
      // console.log(newpaymentlink);
      // console.log(newpaymentlink.data.short_url);

      setInvoicedata({
        ...invoicedata,
        shorturl: newpaymentlink.data.short_url,
      });
    } else {
      // console.log(newpaymentlink);
    }
  };

  return (
    <div className="cursor-pointer w-5 h-5">
      <Sheet>
        <SheetTrigger
          onClick={async () => {
            const customerEntryRes = await fetchCustomerEnteries(cid);
            setCustomerEntry(customerEntryRes.data);
            const customerRes = await fetchCustomer({ queryKey: ["", cid] });
            setCustomer(customerRes.data);
            const total_bottles = customerEntryRes.data.reduce(
              (acc, item) => acc + item.bottle_count,
              0
            );
            setInvoicedata({
              ...invoicedata,
              data: customerRes.data,
              total_bottles: total_bottles,
            });
          }}
        >
          <EyeIcon strokeWidth={3} />
        </SheetTrigger>
        <SheetContent className="p-6 w-full">
          <SheetHeader>
            {customer ? (
              <div>
                <SheetTitle>Customer Details</SheetTitle>
                <SheetDescription>
                  <div className="text-left">
                    <div className="flex justify-between">
                      <div className="font-medium">Name</div>
                      <div className="font-light">{customer?.cname}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">Phone Number</div>
                      <div className="font-light">
                        {customer?.cphone_number}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">Address</div>
                      <div className="font-light">{customer?.caddress}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">Bottle Price</div>
                      <div className="font-light">{customer?.bottle_price}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-medium">Sequence Number</div>
                      <div className="font-light">
                        {customer?.delivery_sequence_number}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 float-start m-3">
                    <InvoiceX cid={cid} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1"
                      onClick={() => {
                        sendinvoicelink();
                      }}
                    >
                      <File className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Send Invoice Link
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1"
                      onClick={() => {
                        alert("Printing");
                      }}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Generate Invoice
                      </span>
                    </Button>
                    <PDFDownloadLink
                      document={<InvoiceX cid={cid} />}
                      fileName="invoice"
                    >
                      {({ loading }) =>
                        loading ? (
                          <button>Loading....</button>
                        ) : (
                          <Button>Download</Button>
                        )
                      }
                    </PDFDownloadLink>
                  </div>
                </SheetDescription>
              </div>
            ) : (
              <div className="mt-4">
                <Skeleton className="h-[90px] w-full" enableAnimation={true} />
              </div>
            )}

            <div className="items-center float-start" id="datatable1">
              {customerEntry ? (
                <DataTable columns={columns1} data={customerEntry} />
              ) : (
                <div className="mb-4">
                  <Skeleton className="h-[300px]" enableAnimation={true} />
                </div>
              )}
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
