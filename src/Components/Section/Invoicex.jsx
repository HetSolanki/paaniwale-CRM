/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from "react";
import { GetCustomerInvoice } from "@/Handlers/GetCustomerInvoice";
import { useUser } from "@/Context/UserContext";
import { Loader2, Send } from "lucide-react";
import { Button } from "../UI/shadcn-UI/button";
import { useToast } from "../UI/shadcn-UI/use-toast";
import { ToastAction } from "../UI/shadcn-UI/toast";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { config } from "@/Data/config";
import { sendInvoice } from "@/Handlers/sendInvoice";
import { pdfGenerator } from "@/Handlers/pdfGenerator";

export const InvoiceX = ({ cid }) => {
  const user = useUser();
  const [click, setClick] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [customerInvoice, setCustomerInvoice] = useState(null);
  const [firstPartCustomers, setFirstPartCustomers] = useState([]);
  const [secondPartCustomers, setSecondPartCustomers] = useState([]);
  const [thirdPartCustomers, setThirdPartCustomers] = useState([]);

  // Pre-load images to avoid delays during PDF generation
  const [logoImage, setLogoImage] = useState(null);
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    // Pre-load logo
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => setLogoImage(logo);
    logo.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;

    // Pre-load user image
    if (user?.user?.image_url) {
      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      userImg.onload = () => setUserImage(userImg);
      userImg.src = user.user.image_url;
    }
  }, [user?.user?.image_url]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const customerData = await GetCustomerInvoice(cid);
      if (customerData?.data) {
        setCustomerInvoice(customerData.data);
        const partitionSize = Math.ceil(
          customerData.data[0]?.customerEntry?.length / 3
        );
        setFirstPartCustomers(
          customerData.data[0]?.customerEntry?.slice(0, partitionSize)
        );
        setSecondPartCustomers(
          customerData.data[0]?.customerEntry?.slice(
            partitionSize,
            partitionSize * 2
          )
        );
        setThirdPartCustomers(
          customerData.data[0]?.customerEntry?.slice(partitionSize * 2)
        );
      }
    };
    fetchCustomerData();
  }, [cid]);

  // Memoize computed values
  const totalAmount = useMemo(() => {
    if (!customerInvoice) return 0;
    return (
      customerInvoice[0]?.totalBottle *
      customerInvoice[0]?.customerDetails?.bottle_price
    );
  }, [customerInvoice]);

  const handleClick = async () => {
    if (!customerInvoice) return;

    setClick(true);

    try {
      // Generate PDF (runs in parallel with any async prep)
      const pdfGenerationPromise = new Promise((resolve) => {
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
        resolve(pdfBlob);
      });

      const [pdfBlob] = await Promise.all([pdfGenerationPromise]);

      const date = new Date();
      const filename = `Invoice-${
        months[date.getMonth()]
      }-${date.getFullYear()}.pdf`;

      const formData = new FormData();
      formData.append("file", pdfBlob, filename);
      formData.append("messaging_product", "whatsapp");

      const uploadRes = await fetch(
        `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/media`,
        {
          method: "POST",
          headers: {
            Authorization: config.whatsapp.authorization,
          },
          body: formData,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!uploadRes.ok) {
        const uploadError = await uploadRes.json();
        throw new Error(
          uploadError?.error?.message || "Failed to upload media"
        );
      }

      const { id: mediaId } = await uploadRes.json();

      const messageData = await sendInvoice(
        customerInvoice,
        mediaId,
        filename,
        totalAmount
      );

      if (!messageData) {
        throw new Error(
          messageData?.error?.message || "Failed to send message"
        );
      }

      toast({
        title: "Invoice Queued",
        description: "Invoice is being sent. It will arrive in 10-15 seconds.",
      });
    } catch (error) {
      console.error("Failed to send invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send invoice!",
        action: (
          <ToastAction altText="Try again" onClick={handleClick}>
            Try again
          </ToastAction>
        ),
      });
    } finally {
      setClick(false);
    }
  };

  return click ? (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please wait
    </Button>
  ) : (
    <Button onClick={handleClick} className="cursor-pointer items-center">
      <Send
        size={24}
        color={`${theme === "dark" ? "black" : "white"}`}
        width={17}
        height={17}
        className="mr-2"
      />
      Send Invoice
    </Button>
  );
};

export default InvoiceX;
