import { handleFetchResponse } from "@/lib/errorHandler";

const DOMAIN_NAME = import.meta.env.VITE_API_BASE_URL;

export const updateUser = async (data, uid) => {
  try {
    const user = await fetch(`${DOMAIN_NAME}/api/auth/user/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        fname: data.fname,
        lname: data.lname,
        phone_number: data.phone_number,
        email: data.email,
      }),
    });

    return await handleFetchResponse(user);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
