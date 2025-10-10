import { config } from "@/Data/config";

export const addpaymententry = async (data, cid) => {
  const paymententry = await fetch(
    `${config.baseUrl}/api/paymentdetails/addpaymentdetails`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        cid,
        amount: data.amount,
        payment_date: data.payment_date,
        payment_status: data.payment_status,
      }),
    }
  );

  return paymententry.json();
};
