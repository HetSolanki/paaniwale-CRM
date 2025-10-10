import { config } from "@/Data/config";

export const createUser = async (data) => {
  const user = await fetch(`${config.baseUrl}/api/auth/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fname: data.fname,
      lname: data.lname,
      phone_number: data.phone_number,
      email: data.email,
      password: data.password,
    }),
  });

  return user.json();
};
