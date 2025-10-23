import { handleFetchResponse } from "@/lib/errorHandler";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export const editcustomer = async (data, id, phone_verification_status) => {
  try {
    const customer = await fetch(
      `${DOMAIN_NAME}/api/customers/customer/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          cname: data.cname,
          cphone_number: data.cphone_number,
          caddress: data.caddress,
          bottle_price: data.bottle_price,
          delivery_sequence_number: data.delivery_sequence_number,
          phone_verification_status,
        }),
      }
    );

    return await handleFetchResponse(customer);
  } catch (error) {
    console.error("Error editing customer:", error);
    throw error;
  }
};
