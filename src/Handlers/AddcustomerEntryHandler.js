import { handleFetchResponse } from "@/lib/errorHandler";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export const getTodayIST = () => {
  // Get current date parts in IST timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.format(new Date());
  return parts; // Returns "2025-10-26" directly in IST
};

export const addcustomerEntry = async (data, cid) => {
  try {
    const customerentry = await fetch(
      `${DOMAIN_NAME}/api/customerentry/addcustomerentry`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          cid,
          bottle_count: data.no_of_bottles,
          delivery_date: getTodayIST(),
          delivery_status: data.delivery_status,
        }),
      }
    );

    return await handleFetchResponse(customerentry);
  } catch (error) {
    console.error("Error adding customer entry:", error);
    throw error;
  }
};

export const updateCustomerEntry = async (entryId, data) => {
  try {
    const response = await fetch(
      `${DOMAIN_NAME}/api/customerentry/updatecustomerentry/${entryId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...data, delivery_date: getTodayIST() }),
      }
    );

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error updating customer entry:", error);
    throw error;
  }
};

export const deleteCustomerEntry = async (entryId) => {
  try {
    const response = await fetch(
      `${DOMAIN_NAME}/api/customerentry/deletecustomerentry/${entryId}`,
      {
        method: "DELETE",
        headers: {
          authorization: `bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error deleting customer entry:", error);
    throw error;
  }
};

export const getAllCustomerEntries = async (customerId) => {
  try {
    console.log(customerId);
    const response = await fetch(
      `${DOMAIN_NAME}/api/customerentry/getallcustomerentry/${customerId}`,
      {
        method: "GET",
        headers: {
          authorization: `bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await handleFetchResponse(response);
    console.log(data);
    return data.data;
  } catch (error) {
    console.error("Error fetching customer entries:", error);
    throw error;
  }
};
