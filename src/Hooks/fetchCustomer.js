import { config } from "@/Data/config";

export const fetchCustomer = async (querykeys) => {
  const userId = querykeys.queryKey[1];
  if (userId) {
    const res = await fetch(
      `${config.baseUrl}/api/customers/customer/${userId}`
    );
    const res_json = await res.json();
    return res_json;
  }
};
