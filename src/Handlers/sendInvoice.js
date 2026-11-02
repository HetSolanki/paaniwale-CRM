import { config } from "@/Data/config";
import { sanitizePhoneNumber } from "@/lib/utils";

export const sendInvoice = async (
  customerInvoice,
  mediaId,
  filename,
  totalAmount
) => {
  const rawPhone = customerInvoice[0]?.customerDetails?.cphone_number;
  const cleanPhone = sanitizePhoneNumber(rawPhone);

  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error(
      `Invalid recipient phone number: "${rawPhone}". Please provide a valid 10-digit mobile number.`
    );
  }

  const response = await fetch(
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
                    id: mediaId,
                    filename: filename,
                  },
                },
              ],
            },
            {
              type: "body",
              parameters: [
                { type: "text", text: String(totalAmount) },
                { type: "text", text: "Paaniwale" },
                { type: "text", text: "Invoice" },
              ],
            },
          ],
        },
      }),
    }
  );

  const messageData = await response.json();

  if (!response.ok || messageData.error) {
    const errorMsg =
      messageData?.error?.message ||
      messageData?.error?.error_user_msg ||
      "Failed to send invoice via WhatsApp API";
    console.error("WhatsApp API Error:", messageData);
    throw new Error(errorMsg);
  }

  return messageData;
};

