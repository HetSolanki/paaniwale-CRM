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
import { ArrowUpDown, MoreVertical, Send, CreditCard, Loader2, FileText } from "lucide-react";
import { Button } from "../Components/UI/shadcn-UI/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../Components/UI/shadcn-UI/dropdown-menu";
import { Editcustomer } from "@/Components/UI/UI-Components/Editcustomer";
import DeleteCustomer from "@/Components/UI/UI-Components/DeleteCustomer";
import ViewCustomer from "@/Components/UI/UI-Components/ViewCustomer";
import { CustomerInvoicePreview } from "@/Components/Section/CustomerInvoicePreview";
import { createPaymentLink } from "@/Handlers/CreatepaymentLinkHandler";
import { fetchCustomerEnteries } from "@/Hooks/fetchCustomerEnteries";
import { GetCustomerInvoice } from "@/Handlers/GetCustomerInvoice";
import { sendInvoice } from "@/Handlers/sendInvoice";
import { pdfGenerator } from "@/Handlers/pdfGenerator";
import { config } from "@/Data/config";
import { toast } from "react-toastify";
import { useState } from "react";
import { useUser } from "@/Context/UserContext";

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

// Actions Component
const CustomerActions = ({ customer }: { customer: Customer }) => {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const user = useUser();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handleSendPaymentLink = async () => {
    setLoading(true);
    try {
      // Fetch customer entries to calculate total bottles
      const customerEntryRes = await fetchCustomerEnteries(customer._id);
      const total_bottles = customerEntryRes.data.reduce(
        (acc: number, item: any) => acc + item.bottle_count,
        0
      );

      const amount = customer.bottle_price * total_bottles;

      const data = {
        amount: amount,
        description: "Payment for Bottles",
        customer_name: customer.cname,
        customer_phone: customer.cphone_number,
        customer_email: "",
        smsnotify: true,
        emailnotify: false,
        reminder_enable: false,
      };

      const response = await createPaymentLink(data);

      if (response.status === "success") {
        toast.success("Payment link sent successfully!");
      } else {
        toast.error("Failed to send payment link");
      }
    } catch (error) {
      console.error("Error sending payment link:", error);
      toast.error("Error sending payment link");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    setLoading(true);
    try {
      // Fetch customer invoice data
      const customerInvoiceData = await GetCustomerInvoice(customer._id);

      // Check if data exists - API returns { data: [...] }
      if (!customerInvoiceData?.data || customerInvoiceData.data.length === 0) {
        toast.error("This customer has no delivery entries to invoice. Please add entries first.");
        setLoading(false);
        return;
      }

      const customerInvoice = customerInvoiceData.data;

      // Check if customer entry exists
      if (!customerInvoice[0]?.customerEntry || customerInvoice[0].customerEntry.length === 0) {
        toast.error("No delivery entries found for this customer");
        setLoading(false);
        return;
      }

      // Check phone verification
      if (!customerInvoice[0]?.customerDetails?.phone_verification_status) {
        toast.error("Please verify customer's phone number first");
        setLoading(false);
        return;
      }

      // Calculate total amount
      const totalAmount = customerInvoice[0]?.totalBottle * customerInvoice[0]?.customerDetails?.bottle_price;

      // Partition customer entries for PDF pages
      const customerEntries = customerInvoice[0]?.customerEntry || [];
      const partitionSize = Math.ceil(customerEntries.length / 3);
      const firstPartCustomers = customerEntries.slice(0, partitionSize);
      const secondPartCustomers = customerEntries.slice(partitionSize, partitionSize * 2);
      const thirdPartCustomers = customerEntries.slice(partitionSize * 2);

      // Pre-load images
      const logoImage = await new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn("Failed to load logo image");
          resolve(null);
        };
        img.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;
      });

      const userImage = await new Promise<HTMLImageElement | null>((resolve) => {
        if (!user?.user?.image_url) {
          console.warn("No QR code URL found in user.user.image_url");
          resolve(null);
          return;
        }
        console.log("Loading QR code from:", user.user.image_url);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          console.log("QR code loaded successfully");
          resolve(img);
        };
        img.onerror = (error) => {
          console.error("Failed to load QR code image:", error);
          resolve(null);
        };
        img.src = user.user.image_url;
      });

      console.log("Logo loaded:", !!logoImage);
      console.log("QR code loaded:", !!userImage);

      // Generate PDF
      const pdf = pdfGenerator(
        user,
        logoImage,
        userImage,
        customerInvoice,
        firstPartCustomers,
        secondPartCustomers,
        thirdPartCustomers,
        totalAmount,
        months
      );

      const pdfBlob = pdf.output("blob");
      const date = new Date();
      const filename = `Invoice-${months[date.getMonth()]}-${date.getFullYear()}.pdf`;

      // Upload to WhatsApp
      const formData = new FormData();
      formData.append("file", pdfBlob, filename);
      formData.append("type", "application/pdf");
      formData.append("messaging_product", "whatsapp");

      const uploadRes = await fetch(
        `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/media`,
        {
          method: "POST",
          headers: {
            Authorization: config.whatsapp.authorization,
          },
          body: formData,
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!uploadRes.ok) {
        const uploadError = await uploadRes.json();
        throw new Error(uploadError?.error?.message || "Failed to upload media");
      }

      const { id: mediaId } = await uploadRes.json();

      // Send invoice via WhatsApp
      const messageData = await sendInvoice(
        customerInvoice,
        mediaId,
        filename,
        totalAmount
      );

      if (messageData) {
        toast.success("Invoice is being sent. It will arrive in 10-15 seconds.");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error: any) {
      console.error("Failed to send invoice:", error);
      toast.error(error.message || "Failed to send invoice!");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewInvoice = () => {
    setPreviewOpen(true);
  };

  return (
    <div className="flex gap-x-2 items-center justify-center">
      <ViewCustomer cid={customer._id} />
      <Editcustomer id={customer._id} />
      <DeleteCustomer cid={customer._id} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePreviewInvoice}>
            <FileText className="mr-2 h-4 w-4" />
            Preview Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendInvoice} disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            Send Invoice
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={handleSendPaymentLink} disabled={loading}>
            <CreditCard className="mr-2 h-4 w-4" />
            Send Payment Link
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Invoice Preview Dialog */}
      <CustomerInvoicePreview
        customerId={customer._id.toString()}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

// Define table columns configuration
export const columns: ColumnDef<Customer>[] = [
  // Delivery Sequence Number Column
  {
    accessorKey: "delivery_sequence_number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 text-left hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Seq #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue("delivery_sequence_number")}
      </span>
    ),
  },

  // Customer Name Column
  {
    accessorKey: "cname",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 text-left hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const customer = row.original;
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        return (
          <div className="space-y-1 py-2">
            <p className="font-semibold text-base capitalize leading-tight">
              {customer.cname}
            </p>
            <p className="text-sm text-muted-foreground leading-tight">
              {customer.caddress}
            </p>
            <p className="text-sm text-muted-foreground leading-tight">
              {customer.cphone_number}
            </p>
          </div>
        );
      }

      return (
        <span className="font-semibold capitalize">
          {row.getValue("cname")}
        </span>
      );
    },
  },

  // Phone Number Column
  {
    accessorKey: "cphone_number",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 text-left hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Phone Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue("cphone_number")}
      </span>
    ),
  },

  // Address Column
  {
    accessorKey: "caddress",
    header: () => <span className="text-left">Address</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("caddress")}
      </span>
    ),
  },

  // Bottle Price Column
  {
    accessorKey: "bottle_price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 text-left hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Bottle Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    header: () => <span className="text-center">Actions</span>,
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      return <CustomerActions customer={customer} />;
    },
  },
];
