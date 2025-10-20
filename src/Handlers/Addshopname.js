import { config } from "@/Data/config";

export const Addshopname = async (cid, name) => {
  const user = await fetch(`${config.baseUrl}/api/auth/user/${cid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      shop_name: name,
    }),
  });

  return user.json();
};
