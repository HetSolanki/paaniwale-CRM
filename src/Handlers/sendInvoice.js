import { config } from "@/Data/config";

export const sendInvoice = async (
  customerInvoice,
  mediaId,
  filename,
  totalAmount
) => {
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
        to: `+91${customerInvoice[0].customerDetails.cphone_number}`,
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
  return messageData;
};
