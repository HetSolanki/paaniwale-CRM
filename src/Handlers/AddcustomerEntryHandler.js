import { config } from "@/Data/config";

export const addcustomerEntry = async (data, cid) => {
  const customerentry = await fetch(
    `${config.baseUrl}/api/customerentry/addcustomerentry`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        cid,
        bottle_count: data.no_of_bottles,
        delivery_date: new Date().toISOString().split("T")[0],
        delivery_status: data.delivery_status,
      }),
    }
  );

  return customerentry.json();
};
