import { config } from "@/Data/config";

export const fetchCustomerEnteries = async (cid) => {
  const customerEnteries = await fetch(
    `${config.baseUrl}/api/customerentry/getallcustomerentry/${cid}`,
    {
      method: "GET",
      headers: {
        authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );

  const res = await customerEnteries.json();

  return res;
};
