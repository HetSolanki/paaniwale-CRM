const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export const fetchCustomers = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await fetch(`${DOMAIN_NAME}/api/customers/customerall`, {
      method: "GET",
      headers: {
        authorization: "Bearer " + token,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const res_json = await res.json();

    if (res_json.status === "error") {
      throw new Error(res_json.message || "Failed to fetch customers");
    }

    return res_json;
  } catch (error) {
    console.error("Error in fetchCustomers:", error);
    throw error;
  }
};
