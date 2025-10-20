import { config } from "@/Data/config";

export const GetAllCustomerInvoice = async () => {
  const customerEntry = await fetch(
    `${config.baseUrl}/api/customerentry/getAllCustomerInvoice`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return customerEntry.json();
};
