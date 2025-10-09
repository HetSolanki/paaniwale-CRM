const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

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
      `${DOMAIN_NAME}/api/customerentry/getallcustomerentry/${cid}`,
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
