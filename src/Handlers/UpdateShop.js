import { handleFetchResponse } from "@/lib/errorHandler";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export const updateshop = async (data, image_url) => {
  try {
    const user = await fetch(`${DOMAIN_NAME}/api/shop/updateshop`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        shop_name: data.shop_name,
        shop_address: data.shop_address,
        gst_number: data.gst_number,
        image_url,
      }),
    });

    return await handleFetchResponse(user);
  } catch (error) {
    console.error("Error updating shop:", error);
    throw error;
  }
};
