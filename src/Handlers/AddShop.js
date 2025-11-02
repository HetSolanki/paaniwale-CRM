import { config } from "@/Data/config";

export const createShop = async (data) => {
  const shop = await fetch(`${config.baseUrl}/api/shop/createshop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      shop_name: data.shop_name,
      gst_number: data.gst_number,
    }),
  });

  return shop.json();
};
