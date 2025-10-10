import { config } from "@/Data/config";

export const createPaymentLink = async (data) => {
  const response = await fetch(
    `${config.baseUrl}/api/paymentlink/createpaymentlink`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.amount,
        description: data.description,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        smsnotify: data.smsnotify,
        emailnotify: data.emailnotify,
        reminder_enable: data.reminder_enable,
        account: data.account_number,
      }),
    }
  );

  return response.json();
};
