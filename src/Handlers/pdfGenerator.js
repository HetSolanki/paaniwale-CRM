import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add page border
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.8);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16, "S");

  // Shop details with better formatting
  pdf.setFontSize(26);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185);
  pdf.text(`${user?.user?.shop_name || "Shop Name"}`, 15, 20);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Address:", 15, 28);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const addressText = pdf.splitTextToSize(
    `${user?.user?.shop_address || "N/A"}`,
    130
  );
  pdf.text(addressText, 38, 28);

  // Add logo with better positioning
  if (logoImage) {
    pdf.addImage(logoImage, "PNG", pageWidth - 35, 12, 25, 25);
  }

  // Invoice section with box
  pdf.setFillColor(240, 240, 240);
  pdf.roundedRect(pageWidth - 70, 40, 55, 32, 2, 2, "F");

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185);
  pdf.text("Invoice #", pageWidth - 67, 48);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  const invoiceNum = `INV-${new Date().getTime().toString().slice(-8)}`;
  pdf.text(invoiceNum, pageWidth - 67, 55);

  const date = new Date();
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Date:", pageWidth - 67, 62);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`,
    pageWidth - 67,
    68
  );

  // Customer details with box
  pdf.setFillColor(240, 240, 240);
  pdf.roundedRect(15, 40, 115, 32, 2, 2, "F");

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185);
  pdf.text("Bill to:", 18, 48);

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    `${customerInvoice?.[0]?.customerDetails?.cname || "Customer"}`,
    18,
    55
  );

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  const custAddress = pdf.splitTextToSize(
    `${customerInvoice?.[0]?.customerDetails?.caddress || "N/A"}`,
    95
  );
  pdf.text(custAddress, 18, 60);
  pdf.text(
    `Ph: ${customerInvoice?.[0]?.customerDetails?.cphone_number || "N/A"}`,
    18,
    68
  );

  // Delivery entries table with autoTable
  const tableData = [];
  const maxRows = Math.max(
    firstPartCustomers?.length || 0,
    secondPartCustomers?.length || 0,
    thirdPartCustomers?.length || 0
  );

  for (let i = 0; i < maxRows; i++) {
    const row = [];

    if (firstPartCustomers?.[i]) {
      row.push(
        firstPartCustomers[i].delivery_date.toString().split("T")[0],
        String(firstPartCustomers[i].bottle_count)
      );
    } else {
      row.push("", "");
    }

    if (secondPartCustomers?.[i]) {
      row.push(
        secondPartCustomers[i].delivery_date.toString().split("T")[0],
        String(secondPartCustomers[i].bottle_count)
      );
    } else {
      row.push("", "");
    }

    if (thirdPartCustomers?.[i]) {
      row.push(
        thirdPartCustomers[i].delivery_date.toString().split("T")[0],
        String(thirdPartCustomers[i].bottle_count)
      );
    } else {
      row.push("", "");
    }

    tableData.push(row);
  }

  // Calculate dynamic sizing based on number of rows
  const totalEntries =
    (firstPartCustomers?.length || 0) +
    (secondPartCustomers?.length || 0) +
    (thirdPartCustomers?.length || 0);

  // Adjust cell padding and font size for large datasets
  const cellPadding = maxRows > 10 ? 1.5 : 2.5;
  const bodyFontSize = maxRows > 10 ? 7 : 9;
  const headFontSize = maxRows > 10 ? 8 : 10;

  pdf.autoTable({
    startY: 78,
    head: [["DATE", "QTY", "DATE", "QTY", "DATE", "QTY"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: headFontSize,
      halign: "center",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: bodyFontSize,
      halign: "center",
      cellPadding: cellPadding,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 15 },
      2: { cellWidth: 30 },
      3: { cellWidth: 15 },
      4: { cellWidth: 30 },
      5: { cellWidth: 15 },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 15, right: 15 },
  });

  console.log(
    `PDF generated with ${totalEntries} total entries (${maxRows} rows)`
  );

  let yOffset = pdf.lastAutoTable.finalY + 12;

  // Summary section with box
  pdf.setFillColor(240, 240, 240);
  pdf.roundedRect(15, yOffset, pageWidth - 30, 50, 2, 2, "F");

  const leftX = 18;
  const rightX = pageWidth - 18;

  // Row 1 - Bottle Price
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Bottle Price:", leftX, yOffset + 8);
  pdf.text(
    `Rs. ${customerInvoice?.[0]?.customerDetails?.bottle_price || 0}`,
    rightX,
    yOffset + 8,
    { align: "right" }
  );

  // Row 2 - Total Delivered Bottles
  pdf.text("Total Delivered Bottle:", leftX, yOffset + 16);
  pdf.text(`${customerInvoice?.[0]?.totalBottle || 0}`, rightX, yOffset + 16, {
    align: "right",
  });

  // Row 3 - Subtotal
  pdf.text("Subtotal:", leftX, yOffset + 24);
  pdf.text(`Rs. ${totalAmount || 0}`, rightX, yOffset + 24, { align: "right" });

  // Divider line
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.5);
  pdf.line(leftX, yOffset + 29, pageWidth - 18, yOffset + 29);

  // Row 4 - Total (Bold and Blue)
  pdf.setFontSize(13);
  pdf.setTextColor(41, 128, 185);
  pdf.text("Total:", leftX, yOffset + 38);
  pdf.text(`Rs. ${totalAmount || 0}`, rightX, yOffset + 38, { align: "right" });

  // Row 5 - Due Balance (Red)
  pdf.setTextColor(220, 53, 69);
  pdf.text("Due Balance:", leftX, yOffset + 46);
  pdf.text(`Rs. ${totalAmount || 0}`, rightX, yOffset + 46, { align: "right" });

  yOffset += 54;

  // Thank you section with more space
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(41, 128, 185);
  pdf.text("Thank you for your business!", pageWidth / 2, yOffset, {
    align: "center",
  });
  yOffset += 12;

  // Contact information box with better spacing
  const contactBoxHeight = 32;
  pdf.setFillColor(240, 240, 240);
  pdf.roundedRect(15, yOffset, pageWidth - 30, contactBoxHeight, 2, 2, "F");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    "For any questions concerning this invoice, contact us:",
    18,
    yOffset + 8
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(
    `Phone: ${user?.user?.uid?.phone_number || "N/A"}`,
    18,
    yOffset + 15
  );
  pdf.text(`Email: ${user?.user?.uid?.email || "N/A"}`, 18, yOffset + 21);

  // Add QR code for payment if available with label and spacing
  if (userImage) {
    const qrSize = 22;
    const qrX = pageWidth - 32;
    const qrY = yOffset + 4;

    // Add QR code
    pdf.addImage(userImage, "PNG", qrX, qrY, qrSize, qrSize);

    // Add "Scan to Pay" label with better styling
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("Scan to Pay", qrX + qrSize / 2, qrY + qrSize + 3, {
      align: "center",
    });
  }

  yOffset += contactBoxHeight + 6;

  // Website footer with more space
  pdf.setTextColor(100, 100, 100);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.text("https://paaniwale.hetsolanki.tech", pageWidth / 2, yOffset, {
    align: "center",
  });

  // Check if content fits on one page, if not add note
  if (yOffset > pageHeight - 20) {
    console.warn("PDF content may overflow to multiple pages");
  }

  return pdf;
};
