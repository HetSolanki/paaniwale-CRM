import PDFDocument from "pdfkit";
import { Buffer } from "buffer";
import fetch from "node-fetch";

/**
 * Fetch image from URL and convert to buffer
 */
const fetchImageBuffer = async (imageUrl) => {
  try {
    if (!imageUrl) return null;
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

/**
 * Generate PDF invoice buffer matching frontend jsPDF format EXACTLY
 * This mimics the jsPDF autoTable layout from the frontend
 */
export const generateInvoicePDF = async (
  user,
  customer,
  entries,
  totalBottles,
  totalAmount,
  qrCodeUrl = null
) => {
  // Fetch QR code image if URL is provided
  let qrBuffer = null;
  if (qrCodeUrl) {
    qrBuffer = await fetchImageBuffer(qrCodeUrl);
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        bufferPages: true,
      });
      const buffers = [];

      // Collect PDF data
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Colors matching frontend
      const primaryColor = [41, 128, 185];
      const lightGray = [240, 240, 240];
      const darkGray = [0, 0, 0];
      const redColor = [220, 53, 69];
      const white = [255, 255, 255];

      // Page dimensions (A4: 595.28 x 841.89 points)
      const pageWidth = 595.28;
      const pageHeight = 841.89;

      // Add page border (matching frontend: 8,8 with pageWidth-16, pageHeight-16)
      doc
        .strokeColor(primaryColor)
        .lineWidth(0.8)
        .rect(8, 8, pageWidth - 16, pageHeight - 16)
        .stroke();

      // === SHOP NAME (matching frontend: 15, 20) ===
      doc
        .fontSize(26)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text(user.shop_name || "Shop Name", 15, 20);

      // === ADDRESS (matching frontend: 15, 28) ===
      doc.fontSize(11).fillColor(darkGray).font("Helvetica-Bold");
      doc.text("Address:", 15, 28);
      doc.fontSize(10).font("Helvetica");
      const addressText = user.shop_address || "N/A";
      doc.text(addressText, 38, 28, { width: 130 });

      // === INVOICE BOX (matching frontend: pageWidth - 70, 40, 55, 32) ===
      doc
        .fillColor(lightGray)
        .roundedRect(pageWidth - 70, 40, 55, 32, 2)
        .fill();

      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Invoice #", pageWidth - 67, 48);

      const invoiceNum = `INV-${new Date().getTime().toString().slice(-8)}`;
      doc
        .fontSize(11)
        .fillColor(darkGray)
        .font("Helvetica")
        .text(invoiceNum, pageWidth - 67, 55);

      const date = new Date();
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Date:", pageWidth - 67, 62);
      doc.font("Helvetica");
      doc.text(
        `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`,
        pageWidth - 67,
        68
      );

      // === CUSTOMER BOX (matching frontend: 15, 40, 115, 32) ===
      doc.fillColor(lightGray).roundedRect(15, 40, 115, 32, 2).fill();

      doc
        .fontSize(14)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Bill to:", 18, 48);

      doc
        .fontSize(12)
        .fillColor(darkGray)
        .font("Helvetica-Bold")
        .text(customer.cname || "Customer", 18, 55);

      doc.fontSize(9).font("Helvetica");
      const custAddress = customer.caddress || "N/A";
      doc.text(custAddress, 18, 60, { width: 95 });
      doc.text(`Ph: ${customer.cphone_number || "N/A"}`, 18, 68);

      // === TABLE SECTION (matching frontend autoTable starting at Y: 78) ===
      // Split entries into 3 columns
      const entriesPerColumn = Math.ceil(entries.length / 3);
      const firstPart = entries.slice(0, entriesPerColumn);
      const secondPart = entries.slice(entriesPerColumn, entriesPerColumn * 2);
      const thirdPart = entries.slice(entriesPerColumn * 2);

      const maxRows = Math.max(
        firstPart.length,
        secondPart.length,
        thirdPart.length
      );

      // Table settings (matching frontend)
      let tableY = 78;
      const cellPadding = maxRows > 10 ? 1.5 : 2.5;
      const headerFontSize = maxRows > 10 ? 8 : 10;
      const bodyFontSize = maxRows > 10 ? 7 : 9;
      const rowHeight = maxRows > 10 ? 9 : 11;

      // Column widths matching frontend: 30, 15, 30, 15, 30, 15
      const colWidths = [30, 15, 30, 15, 30, 15];
      const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
      const tableX = 15; // left margin matching frontend

      // Table Header (matching frontend headStyles)
      doc.fillColor(primaryColor).rect(tableX, tableY, tableWidth, 12).fill();

      doc.fontSize(headerFontSize).fillColor(white).font("Helvetica-Bold");

      const headers = ["DATE", "QTY", "DATE", "QTY", "DATE", "QTY"];
      let headerX = tableX;

      headers.forEach((header, i) => {
        const textWidth = doc.widthOfString(header);
        const centerX = headerX + (colWidths[i] - textWidth) / 2;
        doc.text(header, centerX, tableY + 3);
        headerX += colWidths[i];
      });

      tableY += 12;

      // Table Body (matching frontend autoTable)
      doc.fontSize(bodyFontSize).fillColor(darkGray).font("Helvetica");

      for (let i = 0; i < maxRows; i++) {
        // Alternate row colors
        if (i % 2 === 0) {
          doc
            .fillColor([245, 245, 245])
            .rect(tableX, tableY, tableWidth, rowHeight)
            .fill();
        }

        doc.fillColor(darkGray);

        let cellX = tableX;

        // First column pair (DATE, QTY)
        if (firstPart[i]) {
          const dateStr = new Date(firstPart[i].delivery_date)
            .toISOString()
            .split("T")[0];
          const dateWidth = doc.widthOfString(dateStr);
          const dateCenterX = cellX + (colWidths[0] - dateWidth) / 2;
          doc.text(dateStr, dateCenterX, tableY + cellPadding);
          cellX += colWidths[0];

          const qtyStr = String(firstPart[i].bottle_count);
          const qtyWidth = doc.widthOfString(qtyStr);
          const qtyCenterX = cellX + (colWidths[1] - qtyWidth) / 2;
          doc.text(qtyStr, qtyCenterX, tableY + cellPadding);
          cellX += colWidths[1];
        } else {
          cellX += colWidths[0] + colWidths[1];
        }

        // Second column pair
        if (secondPart[i]) {
          const dateStr = new Date(secondPart[i].delivery_date)
            .toISOString()
            .split("T")[0];
          const dateWidth = doc.widthOfString(dateStr);
          const dateCenterX = cellX + (colWidths[2] - dateWidth) / 2;
          doc.text(dateStr, dateCenterX, tableY + cellPadding);
          cellX += colWidths[2];

          const qtyStr = String(secondPart[i].bottle_count);
          const qtyWidth = doc.widthOfString(qtyStr);
          const qtyCenterX = cellX + (colWidths[3] - qtyWidth) / 2;
          doc.text(qtyStr, qtyCenterX, tableY + cellPadding);
          cellX += colWidths[3];
        } else {
          cellX += colWidths[2] + colWidths[3];
        }

        // Third column pair
        if (thirdPart[i]) {
          const dateStr = new Date(thirdPart[i].delivery_date)
            .toISOString()
            .split("T")[0];
          const dateWidth = doc.widthOfString(dateStr);
          const dateCenterX = cellX + (colWidths[4] - dateWidth) / 2;
          doc.text(dateStr, dateCenterX, tableY + cellPadding);
          cellX += colWidths[4];

          const qtyStr = String(thirdPart[i].bottle_count);
          const qtyWidth = doc.widthOfString(qtyStr);
          const qtyCenterX = cellX + (colWidths[5] - qtyWidth) / 2;
          doc.text(qtyStr, qtyCenterX, tableY + cellPadding);
        }

        // Grid lines (matching frontend lineWidth: 0.1)
        doc
          .strokeColor([200, 200, 200])
          .lineWidth(0.1)
          .rect(tableX, tableY, tableWidth, rowHeight)
          .stroke();

        tableY += rowHeight;
      }

      // === SUMMARY BOX (matching frontend: yOffset + 12) ===
      let yOffset = tableY + 12;

      doc
        .fillColor(lightGray)
        .roundedRect(15, yOffset, pageWidth - 30, 50, 2)
        .fill();

      const leftX = 18;
      const rightColumnX = pageWidth / 2;
      const rightColumnWidth = pageWidth / 2 - 18;

      // Summary rows
      doc.fontSize(11).fillColor(darkGray).font("Helvetica-Bold");

      doc.text("Bottle Price:", leftX, yOffset + 8);
      doc.text(`Rs. ${customer.bottle_price || 0}`, rightColumnX, yOffset + 8, {
        width: rightColumnWidth,
        align: "right",
      });

      doc.text("Total Delivered Bottle:", leftX, yOffset + 16);
      doc.text(`${totalBottles || 0}`, rightColumnX, yOffset + 16, {
        width: rightColumnWidth,
        align: "right",
      });

      doc.text("Subtotal:", leftX, yOffset + 24);
      doc.text(`Rs. ${totalAmount || 0}`, rightColumnX, yOffset + 24, {
        width: rightColumnWidth,
        align: "right",
      });

      // Divider line
      doc
        .strokeColor(primaryColor)
        .lineWidth(0.5)
        .moveTo(leftX, yOffset + 34)
        .lineTo(pageWidth - 18, yOffset + 34)
        .stroke();

      // Total (Blue)
      doc.fontSize(13).fillColor(primaryColor);
      doc.text("Total:", leftX, yOffset + 38);
      doc.text(`Rs. ${totalAmount || 0}`, rightColumnX, yOffset + 38, {
        width: rightColumnWidth,
        align: "right",
      });

      // Due Balance (Red)
      doc.fillColor(redColor);
      doc.text("Due Balance:", leftX, yOffset + 46);
      doc.text(`Rs. ${totalAmount || 0}`, rightColumnX, yOffset + 46, {
        width: rightColumnWidth,
        align: "right",
      });

      yOffset += 60;

      // === THANK YOU ===
      doc
        .fontSize(16)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Thank you for your business!", pageWidth / 2, yOffset, {
          align: "center",
        });

      yOffset += 12;

      // === CONTACT BOX ===
      const contactBoxHeight = 32;
      doc
        .fillColor(lightGray)
        .roundedRect(15, yOffset, pageWidth - 30, contactBoxHeight, 2)
        .fill();

      doc
        .fontSize(9)
        .fillColor(darkGray)
        .font("Helvetica-Bold")
        .text(
          "For any questions concerning this invoice, contact us:",
          18,
          yOffset + 8
        );

      doc.fontSize(8).font("Helvetica");
      doc.text(`Phone: ${user.phone_number || "N/A"}`, 18, yOffset + 15);
      doc.text(`Email: ${user.email || "N/A"}`, 18, yOffset + 21);

      // QR Code (matching frontend: pageWidth - 32, yOffset + 4, 22, 22)
      if (qrBuffer) {
        const qrSize = 22;
        const qrX = pageWidth - 32;
        const qrY = yOffset + 4;

        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

        doc
          .fontSize(7)
          .fillColor(primaryColor)
          .font("Helvetica-Bold")
          .text("Scan to Pay", qrX - 2, qrY + qrSize + 3, {
            width: qrSize + 4,
            align: "center",
          });
      }

      yOffset += contactBoxHeight + 6;

      // === FOOTER ===
      doc
        .fontSize(8)
        .fillColor([100, 100, 100])
        .font("Helvetica-Oblique")
        .text("https://paaniwale.hetsolanki.tech", pageWidth / 2, yOffset, {
          align: "center",
        });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
