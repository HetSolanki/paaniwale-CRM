import { config } from "@/Data/config";

export const fetchpaymentdata = async () => {
  console.log("Fetching Payment Data...");
  const paymentdata = await fetch(
    `${config.baseUrl}/api/customerentry/customersforpayment`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  const res = await paymentdata.json();
  return res.message;
};
