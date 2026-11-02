import { jsPDF } from "jspdf";
import { config } from "@/Data/config";

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

export const generatePartyOrderPDF = (order, user) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ============ HEADER SECTION ============
  pdf.setFillColor(37, 99, 235); // Blue-600
  pdf.rect(0, 0, pageWidth, 40, "F");

  // Company name and logo
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(user?.shop_name || "Your Shop Name", 15, 15);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(user?.shop_address || "Shop Address", 15, 23);
  pdf.text("Phone: " + (user?.uid?.phone_number || "N/A"), 15, 29);

  // Logo
  try {
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = `https://res.cloudinary.com/${config.cloud.name}/image/upload/v1722239069/Dhandha-Assests/paniwala-1300x1300_xks3or.png`;
    pdf.setFillColor(255, 255, 255);
    pdf.circle(pageWidth - 20, 20, 12, "F");
    pdf.addImage(logo, "PNG", pageWidth - 28, 12, 16, 16);
  } catch (error) {
    console.log("Logo loading error:", error);
  }

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // ============ INVOICE TITLE ============
  let yPos = 50;

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("PARTY ORDER INVOICE", 15, yPos);

  // Invoice number box
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(pageWidth - 65, yPos - 7, 50, 20);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("Invoice Number", pageWidth - 62, yPos - 2);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  const invoiceNum = "PO-" + (order._id ? order._id.slice(-8).toUpperCase() : "INV");
  pdf.text(invoiceNum, pageWidth - 62, yPos + 5);

  // Dates
  const currentDate = new Date();
  const deliveryDate = new Date(order.delivery_date || Date.now());

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "Date: " +
      currentDate.getDate() +
      " " +
      months[currentDate.getMonth()] +
      " " +
      currentDate.getFullYear(),
    pageWidth - 62,
    yPos + 10
  );

  // ============ CUSTOMER DETAILS ============
  yPos = 75;

  // Bill To Section
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.rect(15, yPos, 85, 35);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(37, 99, 235);
  pdf.text("BILL TO", 18, yPos + 6);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(order.party_name || "N/A", 18, yPos + 13);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 60);
  pdf.text("Event: " + (order.event_type || "N/A"), 18, yPos + 19);

  // Address handling with text wrapping
  const addressLines = pdf.splitTextToSize(order.party_address || "N/A", 75);
  pdf.text(addressLines, 18, yPos + 24);

  const addressHeight = addressLines.length * 4;
  pdf.text(
    "Ph: " + (order.party_phone || "N/A"),
    18,
    yPos + 24 + addressHeight
  );

  // Event Details Section
  pdf.rect(pageWidth - 70, yPos, 55, 35);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(37, 99, 235);
  pdf.text("EVENT DETAILS", pageWidth - 67, yPos + 6);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 60);
  pdf.text("Delivery Date:", pageWidth - 67, yPos + 13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    deliveryDate.getDate() +
      " " +
      months[deliveryDate.getMonth()] +
      " " +
      deliveryDate.getFullYear(),
    pageWidth - 67,
    yPos + 18
  );

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 60);
  pdf.text("Status:", pageWidth - 67, yPos + 24);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(order.status || "Pending", pageWidth - 67, yPos + 29);

  // ============ ORDER ITEMS TABLE ============
  yPos = 120;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Order Details", 15, yPos);

  yPos += 6;

  // Table header
  pdf.setFillColor(37, 99, 235);
  pdf.rect(15, yPos, pageWidth - 30, 8, "F");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("ITEM DESCRIPTION", 18, yPos + 5.5);
  pdf.text("QTY", pageWidth / 2 - 10, yPos + 5.5);
  pdf.text("RATE", pageWidth / 2 + 20, yPos + 5.5);
  pdf.text("AMOUNT", pageWidth - 35, yPos + 5.5);

  yPos += 8;
  pdf.setTextColor(0, 0, 0);

  // Table border
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);

  // Cold Bottles Row
  if (order.cold_bottle_quantity > 0) {
    pdf.line(15, yPos, pageWidth - 15, yPos);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("Cold Water Bottles (Chilled)", 18, yPos + 5);
    pdf.text(
      String(order.cold_bottle_quantity),
      pageWidth / 2 - 10,
      yPos + 5
    );
    pdf.text(
      "Rs. " + String(order.cold_bottle_price),
      pageWidth / 2 + 20,
      yPos + 5
    );

    const coldTotal = order.cold_bottle_quantity * order.cold_bottle_price;
    pdf.setFont("helvetica", "bold");
    pdf.text("Rs. " + String(coldTotal), pageWidth - 35, yPos + 5);

    yPos += 8;
  }

  // Normal Bottles Row
  if (order.normal_bottle_quantity > 0) {
    pdf.line(15, yPos, pageWidth - 15, yPos);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("Normal Water Bottles (Room Temp)", 18, yPos + 5);
    pdf.text(
      String(order.normal_bottle_quantity),
      pageWidth / 2 - 10,
      yPos + 5
    );
    pdf.text(
      "Rs. " + String(order.normal_bottle_price),
      pageWidth / 2 + 20,
      yPos + 5
    );

    const normalTotal =
      order.normal_bottle_quantity * order.normal_bottle_price;
    pdf.setFont("helvetica", "bold");
    pdf.text("Rs. " + String(normalTotal), pageWidth - 35, yPos + 5);

    yPos += 8;
  }

  // Table bottom border
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, yPos, pageWidth - 15, yPos);

  // ============ TOTALS SECTION ============
  yPos += 8;

  const totalBottles =
    (order.cold_bottle_quantity || 0) + (order.normal_bottle_quantity || 0);
  const subtotal = order.total_amount || 0;

  // Total bottles
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 60);
  pdf.text("Total Bottles:", pageWidth - 75, yPos);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(String(totalBottles), pageWidth - 35, yPos);

  yPos += 8;

  // Grand Total
  pdf.setDrawColor(34, 197, 94);
  pdf.setLineWidth(1);
  pdf.rect(pageWidth - 80, yPos - 4, 65, 10);

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("GRAND TOTAL:", pageWidth - 77, yPos + 3);

  pdf.setFontSize(13);
  pdf.setTextColor(22, 163, 74); // Green-600
  pdf.text("Rs. " + String(subtotal), pageWidth - 35, yPos + 3);

  // ============ SPECIAL INSTRUCTIONS ============
  if (order.notes && order.notes.trim()) {
    yPos += 18;

    pdf.setDrawColor(251, 191, 36);
    pdf.setLineWidth(0.5);
    pdf.rect(15, yPos, pageWidth - 30, 25);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(161, 98, 7);
    pdf.text("SPECIAL INSTRUCTIONS", 18, yPos + 6);

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80, 80, 80);
    const notesLines = pdf.splitTextToSize(order.notes, pageWidth - 40);
    pdf.text(notesLines, 18, yPos + 12);

    yPos += 25;
  }

  // ============ FOOTER ============
  yPos = pageHeight - 40;

  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.line(15, yPos, pageWidth - 15, yPos);

  yPos += 6;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(34, 197, 94);
  pdf.text("Thank you for your business!", 15, yPos);

  yPos += 8;

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("For any queries, please contact:", 15, yPos);

  yPos += 5;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Email: " + (user?.uid?.email || "contact@example.com"), 15, yPos);
  pdf.text("Phone: " + (user?.uid?.phone_number || "N/A"), 15, yPos + 5);

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(150, 150, 150);
  pdf.text("Powered by PaaaniWale", pageWidth / 2 - 25, pageHeight - 8);

  // QR Code or shop image
  if (user?.image_url) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = user.image_url;
      pdf.addImage(img, "PNG", pageWidth - 35, yPos - 6, 20, 20);
    } catch (error) {
      console.log("QR image error:", error);
    }
  }

  return pdf;
};
