import { config } from "@/Data/config";

export const GetCustomerInvoice = async (cid) => {
  const customerEntry = await fetch(
    `${config.baseUrl}/api/customerentry/getCustomerInvoice/${cid}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const res = await customerEntry.json();
  return res;
};
