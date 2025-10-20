import { handleFetchResponse } from "@/lib/errorHandler";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export const createUser = async (data) => {
  try {
    const user = await fetch(`${DOMAIN_NAME}/api/auth/user`, {
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

    return await handleFetchResponse(user);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
