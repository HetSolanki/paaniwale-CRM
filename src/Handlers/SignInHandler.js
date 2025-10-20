import { config } from "@/Data/config";
import { handleFetchResponse } from "@/lib/errorHandler";

export const signinuser = async (data) => {
  try {
    const response = await fetch(`${config.baseUrl}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: data.phone_number,
        password: data.password,
      }),
    });

    return await handleFetchResponse(response);
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};
