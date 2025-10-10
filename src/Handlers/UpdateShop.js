import { config } from "@/Data/config";

export const updateshop = async (data, image_url) => {
  const user = await fetch(`${config.baseUrl}/api/shop/updateshop`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      shop_name: data.shop_name,
      shop_address: data.shop_address,
      image_url,
    }),
  });

  return user.json();
};
