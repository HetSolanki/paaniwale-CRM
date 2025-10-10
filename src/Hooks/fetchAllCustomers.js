import { config } from "@/Data/config";

export const fetchCustomers = async () => {
  const res = await fetch(`${config.baseUrl}/api/customers/customerall`, {
    method: "GET",
    headers: {
      authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  const res_json = await res.json();
  return res_json;
};
