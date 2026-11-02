import { config } from "@/Data/config";
import { sanitizePhoneNumber } from "@/lib/utils";
import { generatePartyOrderPDF } from "./generatePartyOrderPDF";
import { updatePartyOrderInvoice } from "./PartyOrderHandler";

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

export const sendPartyOrderWhatsApp = async (order, user) => {
  if (!order) {
    throw new Error("Order data is required");
  }

  const rawPhone = order.party_phone;
  const cleanPhone = sanitizePhoneNumber(rawPhone);

  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error(
      `Invalid recipient phone number: "${rawPhone}". Please provide a valid 10-digit mobile number.`
    );
  }

  // 1. Generate PDF
  const pdf = generatePartyOrderPDF(order, user);
  const pdfBlob = pdf.output("blob");

  // 2. Convert to base64
  const base64data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });

  // 3. Upload to Cloudinary
  const formData = new FormData();
  formData.append("file", `data:application/pdf;base64,${base64data}`);
  formData.append("upload_preset", config.cloud.uploadPreset);
  formData.append("folder", "Paaniwale-Party-Invoices");

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloud.name}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || "Failed to upload invoice to Cloudinary storage"
    );
  }

  const uploadData = await uploadResponse.json();
  const pdfUrl = uploadData.secure_url;

  // 4. Send WhatsApp template message
  const whatsappDate = new Date();
  const invoiceResponse = await fetch(
    `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: config.whatsapp.authorization,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `91${cleanPhone}`,
        type: "template",
        template: {
          name: "purchase_receipt_1",
          language: { code: "en_US" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "document",
                  document: {
                    link: pdfUrl,
                    filename: `${order.event_type || "Party-Order"}-${
                      months[whatsappDate.getMonth()]
                    }-${whatsappDate.getFullYear()}`,
                  },
                },
              ],
            },
            {
              type: "body",
              parameters: [
                { type: "text", text: String(order.total_amount || 0) },
                { type: "text", text: user?.shop_name || "Paaniwale" },
                { type: "text", text: "Party Order Invoice" },
              ],
            },
          ],
        },
      }),
    }
  );

  const invoiceResult = await invoiceResponse.json();

  if (!invoiceResponse.ok || invoiceResult.error) {
    const errorMsg =
      invoiceResult?.error?.message ||
      invoiceResult?.error?.error_user_msg ||
      "Failed to deliver invoice via WhatsApp API";
    throw new Error(errorMsg);
  }

  // 5. Update invoice status in backend
  try {
    await updatePartyOrderInvoice(order._id, "");
  } catch (err) {
    console.warn("Could not update party order invoice status in DB:", err);
  }

  return { success: true, pdfUrl, invoiceResult };
};
