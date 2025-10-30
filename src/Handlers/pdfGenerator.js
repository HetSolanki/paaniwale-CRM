import jsPDF from "jspdf";

export const pdfGenerator = (
  user,
  logoImage,
  userImage,
  customerInvoice,
  firstPartCustomers,
  secondPartCustomers,
  thirdPartCustomers,
  totalAmount,
  months
) => {
  const pdf = new jsPDF({ compress: true });

  // Shop details
  pdf.setFontSize(24);
  pdf.setFont("Helvetica-Bold", "bold");
  pdf.text(`${user?.user?.shop_name}`, 15, 15);
  pdf.setFontSize(16);
  pdf.setFont("Helvetica-Bold", "bold");
  pdf.text("Address:", 15, 25);
  pdf.setFont("Helvetica", "normal");
  pdf.text(`${user?.user?.shop_address}`, 38, 25);

  // Add logo only if pre-loaded
  if (logoImage) {
    pdf.addImage(logoImage, "PNG", 180, 10, 20, 20);
  }

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
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + 7);
  pdf.text(
    `Due date: ${dueDate.getDate()}-${
      months[dueDate.getMonth()]
    }-${dueDate.getFullYear()}`,
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
    firstPartCustomers?.length || 0,
    secondPartCustomers?.length || 0,
    thirdPartCustomers?.length || 0
  );

  for (let i = 0; i < maxRows; i++) {
    if (firstPartCustomers?.[i]) {
      pdf.text(
        firstPartCustomers[i].delivery_date.toString().split("T")[0],
        15,
        yOffset
      );
      pdf.text(String(firstPartCustomers[i].bottle_count), 45, yOffset);
    }
    if (secondPartCustomers?.[i]) {
      pdf.text(
        secondPartCustomers[i].delivery_date.toString().split("T")[0],
        85,
        yOffset
      );
      pdf.text(String(secondPartCustomers[i].bottle_count), 115, yOffset);
    }
    if (thirdPartCustomers?.[i]) {
      pdf.text(
        thirdPartCustomers[i].delivery_date.toString().split("T")[0],
        145,
        yOffset
      );
      pdf.text(String(thirdPartCustomers[i].bottle_count), 175, yOffset);
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

  pdf.setFont("helvetica", "bold");
  pdf.text("Subtotal:", 15, yOffset);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${totalAmount}`, 95, yOffset);
  yOffset += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Total:", 15, yOffset);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${totalAmount}`, 95, yOffset);
  yOffset += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Amount paid:", 15, yOffset);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Rs. ${totalAmount}`, 95, yOffset);
  yOffset += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Due balance:", 15, yOffset);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Rs. ${totalAmount}`, 95, yOffset);

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

  // Add user image only if pre-loaded
  if (userImage) {
    pdf.addImage(userImage, "PNG", 130, yOffset + 5, 50, 50);
  }

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  yOffset += 10;
  pdf.text(`${user?.user?.uid?.phone_number}`, 15, yOffset);
  yOffset += 7;
  pdf.text(`${user?.user?.uid?.email}`, 15, yOffset);
  yOffset += 15;

  pdf.setTextColor(0, 0, 0, 0.5);
  pdf.setFont("helvetica", "italic");
  pdf.text("https://paaniwale.hetsolanki.tech", 15, yOffset);

  return pdf;
};
