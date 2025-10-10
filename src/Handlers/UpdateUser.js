import { config } from "@/Data/config";

export const updateUser = async (data, uid) => {
  const user = await fetch(`${config.baseUrl}/api/auth/user/${uid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fname: data.fname,
      lname: data.lname,
      phone_number: data.phone_number,
      email: data.email,
    }),
  });

  return user.json();
};
