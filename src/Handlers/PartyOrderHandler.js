import { handleFetchResponse } from "@/lib/errorHandler";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

// Create party order
export const createPartyOrder = async (data) => {
  try {
    const response = await fetch(`${DOMAIN_NAME}/api/partyorder/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error creating party order:", error);
    throw error;
  }
};

// Get all party orders
export const getPartyOrders = async () => {
  try {
    const response = await fetch(`${DOMAIN_NAME}/api/partyorder/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error fetching party orders:", error);
    throw error;
  }
};

// Get single party order
export const getPartyOrderById = async (id) => {
  try {
    const response = await fetch(`${DOMAIN_NAME}/api/partyorder/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error fetching party order:", error);
    throw error;
  }
};

// Update party order
export const updatePartyOrder = async (id, data) => {
  try {
    const response = await fetch(`${DOMAIN_NAME}/api/partyorder/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error updating party order:", error);
    throw error;
  }
};

// Delete party order
export const deletePartyOrder = async (id) => {
  try {
    const response = await fetch(`${DOMAIN_NAME}/api/partyorder/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error deleting party order:", error);
    throw error;
  }
};

// Update invoice status
export const updatePartyOrderInvoice = async (id, paymentLink) => {
  try {
    const response = await fetch(
      `${DOMAIN_NAME}/api/partyorder/invoice/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ payment_link: paymentLink }),
      }
    );

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};
