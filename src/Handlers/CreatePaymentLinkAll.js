import { config } from "@/Data/config";

export const createPaymentLinkAll = async () => {
  const allCustomers = await fetch(
    `${config.baseUrl}/api/paymentlink/createpaymentlinkall`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "Payment for Bottles",
        smsnotify: true,
        emailnotify: false,
        reminder_enable: false,
      }),
    }
  );

  return allCustomers.json();
};
