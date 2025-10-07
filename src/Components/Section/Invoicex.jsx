/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { GetCustomerInvoice } from "@/Handlers/GetCustomerInvoice";
import { useUser } from "@/Context/UserContext";
import { Loader2, Send } from "lucide-react";
import { Button } from "../UI/shadcn-UI/button";
import { useToast } from "../UI/shadcn-UI/use-toast";
import { ToastAction } from "../UI/shadcn-UI/toast";
import { useTheme } from "@/Context/ThemeProviderContext ";
import { config } from "@/Data/meta";

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

  useEffect(() => {
    const fetchCustomerData = async () => {
      // console.log(cid);
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

  const handleClick = async () => {
    setClick(true);
    const pdf = new jsPDF();

    // Shop details
    pdf.setFontSize(24);
    pdf.setFont("Helvetica-Bold", "bold");
    pdf.text(`${user?.user?.shop_name}`, 15, 15);
    pdf.setFontSize(16);
    pdf.setFont("Helvetica-Bold", "bold");
    pdf.text("Address:", 15, 25);
    pdf.setFont("Helvetica", "normal");
    pdf.text(`${user?.user?.shop_address}`, 38, 25);

    const logo = new Image();
    logo.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;
    pdf.addImage(logo, "png", 180, 10, 20, 20);

    // Invoice details
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice #", 145, 45);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("INV-20240616-0134", 145, 52);

    // Customer details
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Bill to:", 15, 45);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${customerInvoice?.[0]?.customerDetails?.cname}`, 15, 52);
    pdf.text(`${customerInvoice?.[0]?.customerDetails?.caddress}`, 15, 59);
    pdf.text(`${customerInvoice?.[0]?.customerDetails?.cphone_number}`, 15, 66);

    // Invoice dates
    const date = new Date();
    pdf.setFontSize(12);
    pdf.text(
      `Invoice date: ${date.getDate()}-${
        months[date.getMonth()]
      }-${date.getFullYear()}`,
      145,
      59
    );
    date.setDate(date.getDate() + 7);
    pdf.text(
      `Due date: ${date.getDate()}-${
        months[date.getMonth()]
      }-${date.getFullYear()}`,
      145,
      66
    );

    // Table headers
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("DATE", 15, 80);
    pdf.text("QTY", 45, 80);
    pdf.text("DATE", 85, 80);
    pdf.text("QTY", 115, 80);
    pdf.text("DATE", 145, 80);
    pdf.text("QTY", 175, 80);

    // Table content
    pdf.setFont("helvetica", "normal");
    let yOffset = 90;
    const maxRows = Math.max(
      firstPartCustomers?.length,
      secondPartCustomers?.length,
      thirdPartCustomers?.length
    );

    for (let i = 0; i < maxRows; i++) {
      if (firstPartCustomers[i]) {
        pdf.text(firstPartCustomers?.[i]?.delivery_date, 15, yOffset);
        pdf.text(firstPartCustomers?.[i]?.bottle_count.toString(), 45, yOffset);
      }
      if (secondPartCustomers[i]) {
        pdf.text(secondPartCustomers?.[i]?.delivery_date, 85, yOffset);
        pdf.text(
          secondPartCustomers?.[i]?.bottle_count.toString(),
          115,
          yOffset
        );
      }
      if (thirdPartCustomers[i]) {
        pdf.text(thirdPartCustomers?.[i]?.delivery_date, 145, yOffset);
        pdf.text(
          thirdPartCustomers?.[i]?.bottle_count.toString(),
          175,
          yOffset
        );
      }
      yOffset += 7;
    }

    // Total section
    yOffset += 7;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Bottle Price:", 15, yOffset);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `${customerInvoice?.[0]?.customerDetails?.bottle_price}`,
      95,
      yOffset
    );
    yOffset += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total Delivered Bottle:", 15, yOffset);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${customerInvoice?.[0]?.totalBottle}`, 95, yOffset);
    yOffset += 10;

    const total_amount =
      customerInvoice?.[0]?.totalBottle *
      customerInvoice?.[0]?.customerDetails?.bottle_price;

    pdf.setFont("helvetica", "bold");
    pdf.text("Subtotal:", 15, yOffset);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${total_amount}`, 95, yOffset);
    yOffset += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Total:", 15, yOffset);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${total_amount}`, 95, yOffset);
    yOffset += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Amount paid:", 15, yOffset);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Rs. ${total_amount}`, 95, yOffset);
    yOffset += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Due balance:", 15, yOffset);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Rs. ${total_amount}`, 95, yOffset);

    // Footer
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Thank you!", 15, yOffset);
    yOffset += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0, 0.5);
    pdf.text(
      "If you have any questions concerning this invoice, use the following contact information:",
      15,
      yOffset
    );

    const img = new Image();
    img.src = user?.user?.image_url;
    pdf.addImage(img, "png", 130, yOffset + 5, 50, 50);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    yOffset += 10;
    pdf.text(`${user?.user?.uid?.phone_number}`, 15, yOffset);
    yOffset += 7;
    pdf.text(`${user?.user?.uid?.email}`, 15, yOffset);
    yOffset += 15;

    pdf.setTextColor(0, 0, 0, 0.5);
    pdf.setFont("helvetica", "italic");
    pdf.text("https://paaniwale.com", 15, yOffset);

    const pdfBlob = pdf.output("blob");
    const reader = new FileReader();

    customerInvoice &&
      (reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1];

        try {
          const formData = new FormData();
          formData.append("file", `data:application/pdf;base64,${base64data}`);
          formData.append("upload_preset", config.cloud.uploadPreset);
          formData.append("folder", "Paaniwale-Invoices");

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${config.cloud.name}/image/upload`,
            { method: "POST", body: formData }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const responseData = await response.json();

          const date = new Date();

          const total_amount =
            customerInvoice?.[0]?.totalBottle *
            customerInvoice?.[0]?.customerDetails?.bottle_price;

          console.log(responseData.secure_url);
          const res =
            (await fetch(
              `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/messages`,

              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: config.whatsapp.authoritzation, // Use your access token
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  recipient_type: "individual",
                  to: `+91${customerInvoice?.[0]?.customerDetails?.cphone_number}`,
                  type: "template",
                  template: {
                    name: "purchase_receipt_1",
                    language: {
                      code: "en_US",
                    },
                    components: [
                      {
                        type: "header",
                        parameters: [
                          {
                            type: "document",
                            document: {
                              link: responseData?.secure_url ?? "Address",
                              filename:
                                `${
                                  months[date?.getMonth()]
                                } - ${date?.getFullYear()}` ?? "Invoice.pdf",
                            },
                          },
                        ],
                      },
                      {
                        type: "body",
                        parameters: [
                          { type: "text", text: total_amount + "" },
                          {
                            type: "text",
                            text: "Paaniwale",
                          },
                          { type: "text", text: "Invoice" },
                        ],
                      },
                    ],
                  },
                }),
              }
            )) ?? {};

          const data = await res.json();
          // console.log(data);
          if (!res.ok) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to send message!",
            });
            setClick(false);
            throw new Error(`Error: ${data.error.message}`);
          } else {
            toast({
              title: "Success",
              description: "Message sent successfully!",
            });
            setClick(false);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to send message!",
            action: (
              <ToastAction altText="Try again" onClick={handleClick}>
                Try again
              </ToastAction>
            ),
          });
          setClick(false);
          console.error("Failed to upload PDF:", error);
          alert("Failed to upload PDF.");
        }
      });

    reader.readAsDataURL(pdfBlob);
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
