import { config } from "@/Data/config";

export const fetchCustomerEnteries = async (cid) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!cid) {
      throw new Error("Customer ID is required");
    }

    const customerEnteries = await fetch(
      `${config.baseUrl}/api/customerentry/getallcustomerentry/${cid}`,
      {
        method: "GET",
        headers: {
          authorization: "Bearer " + token,
        },
      }
    );

    if (!customerEnteries.ok) {
      throw new Error(`HTTP error! status: ${customerEnteries.status}`);
    }

    const res = await customerEnteries.json();

    if (res.status === "error") {
      throw new Error(res.message || "Failed to fetch customer entries");
    }
    return res;
  } catch (error) {
    console.error("Error in fetchCustomerEnteries:", error);
    throw error;
  }
};
