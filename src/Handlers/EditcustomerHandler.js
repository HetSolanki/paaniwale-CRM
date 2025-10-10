import { config } from "@/Data/config";

export const editcustomer = async (data, id) => {
  const customer = await fetch(
    `${config.baseUrl}/api/customers/customer/${id}`,
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
      }),
    }
  );

  return customer.json();
};
