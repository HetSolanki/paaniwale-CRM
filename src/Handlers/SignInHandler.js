import { config } from "@/Data/config";

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

    if (!response.ok) {
      console.log("SignIn Error:", response.status, response.statusText);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};
