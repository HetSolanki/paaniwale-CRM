/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { useUser } from "@/Context/UserContext";
import { GetAllCustomerInvoice } from "@/Handlers/GetAllCustomerInvoice";
import { Button } from "../UI/shadcn-UI/button";
import { Loader2, Send } from "lucide-react";
import { useToast } from "../UI/shadcn-UI/use-toast";

export const InvoiceAll = () => {
  const user = useUser();
  const [customerInvoice, setCustomerInvoice] = useState(null);
  const [click, setClick] = useState(false);

  const { toast } = useToast();
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

  useEffect(() => {
    const fetchCustomerData = async () => {
      const customerData = await GetAllCustomerInvoice();
      if (customerData?.data) {
        setCustomerInvoice(customerData.data);
      }
    };
    fetchCustomerData();
  }, []);

  const handleClick = async () => {
    const confirmation = confirm(
      "Are you sure you want to send invoice to all customers?"
    );

    if (!confirmation) {
      return;
    } else {
      alert("Send Invoice to All Customers");
      setClick(true);

      customerInvoice.map((customer, index) => {
        const partitionSize = Math.ceil(
          customerInvoice[index].customerEntry.length / 3
        );

        const firstPartCustomers = customerInvoice[index].customerEntry.slice(
          0,
          partitionSize
        );
        const secondPartCustomers = customerInvoice[index].customerEntry.slice(
          partitionSize,
          partitionSize * 2
        );
        const thirdPartCustomers = customerInvoice[index].customerEntry.slice(
          partitionSize * 2
        );
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
        logo.src =
          "https://res.cloudinary.com/fdgj4xhhgq/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png";
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
        pdf.text(`${customerInvoice?.[index]?.customerDetails?.cname}`, 15, 52);
        pdf.text(
          `${customerInvoice?.[index]?.customerDetails?.caddress}`,
          15,
          59
        );
        pdf.text(
          `${customerInvoice?.[index]?.customerDetails?.cphone_number}`,
          15,
          66
        );

        const date = new Date();

        // Invoice dates
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
            pdf.text(firstPartCustomers[i]?.delivery_date, 15, yOffset);
            pdf.text(
              firstPartCustomers[i]?.bottle_count.toString(),
              45,
              yOffset
            );
          }
          if (secondPartCustomers[i]) {
            pdf.text(secondPartCustomers[i]?.delivery_date, 85, yOffset);
            pdf.text(
              secondPartCustomers[i]?.bottle_count.toString(),
              115,
              yOffset
            );
          }
          if (thirdPartCustomers[i]) {
            pdf.text(thirdPartCustomers[i]?.delivery_date, 145, yOffset);
            pdf.text(
              thirdPartCustomers[i]?.bottle_count.toString(),
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
          `${customerInvoice?.[index]?.customerDetails?.bottle_price}`,
          95,
          yOffset
        );
        yOffset += 10;

        pdf.setFont("helvetica", "bold");
        pdf.text("Total Delivered Bottle:", 15, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${customerInvoice?.[index]?.totalBottle}`, 95, yOffset);
        yOffset += 10;

        const total_amount =
          customerInvoice?.[index]?.totalBottle *
          customerInvoice?.[index]?.customerDetails?.bottle_price;

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

        reader.onloadend = async () => {
          const base64data = reader.result.split(",")[1];

          try {
            const formData = new FormData();
            formData.append(
              "file",
              `data:application/pdf;base64,${base64data}`
            );
            formData.append("upload_preset", "wnjb2gh7");
            formData.append("folder", "Dhandha");

            const response = await fetch(
              "https://api.cloudinary.com/v1_1/fdgj4xhhgq/image/upload",
              { method: "POST", body: formData }
            );

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const responseData = await response.json();

            const date = new Date();
            const res = await fetch(
              `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHASTAPP_PHONE_NUMBER_ID}/messages`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer EAAMfDZCmvZCH4BOZCtP1QWHjVZBZBBqQZAJqr1aWLFanasj5GWsxxpXPtcDZAPVyLnSDCbXQ2T9yQm8BP89yWNx5isMZC7sKCX3awqjZAhZBKtXvnzTq99UKh9tfL6T182ZCpzH0YtVWMUtE9uNZAvelLX1PjtPW5JOqXcrnSGVBw9VUAxi6FqxPQAIW9vnnl3odfoPGPwZDZD`, // Use your access token
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  recipient_type: "individual",
                  to: `91${customer?.customerDetails?.cphone_number}`,
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
                              link: responseData.secure_url,
                              filename: `${
                                months[date.getMonth()]
                              } - ${date.getFullYear()}`,
                            },
                          },
                        ],
                      },
                      {
                        type: "body",
                        parameters: [
                          { type: "text", text: total_amount },
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
            );

            const data = await res.json();
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
            });
            setClick(false);
            console.error("Failed to upload PDF:", error);
            alert("Failed to upload PDF.");
          }
        };

        reader.readAsDataURL(pdfBlob);
      });
    }
  };

  return (
    <div>
      {click ? (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      ) : (
        <Button
          onClick={handleClick}
          variant="default"
          size="sm"
          className="h-8 gap-1"
        >
          <Send className="h-3.5 w-3.5" />
          Send Invoice
        </Button>
      )}
    </div>
  );
};

export default InvoiceAll;
