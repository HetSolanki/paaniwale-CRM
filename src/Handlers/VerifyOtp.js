import { config } from "@/Data/config";

export const VerifyOtp = async (data, phone_number) => {
  const verification = await fetch(`${config.baseUrl}/api/auth/verifyotp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phone_number,
      otp: data.pin,
    }),
  });
  return verification.json();
};
