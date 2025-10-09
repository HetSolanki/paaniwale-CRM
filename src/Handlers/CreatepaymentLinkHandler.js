import { handleFetchResponse } from "@/lib/errorHandler";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export const createPaymentLink = async (data) => {
  try {
    const response = await fetch(
      `${DOMAIN_NAME}/api/paymentlink/createpaymentlink`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + localStorage.getItem("token"),
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

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw error;
  }
};
