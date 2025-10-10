import { config } from "@/Data/config";

export const sendOtp = async (data) => {
  const response = await fetch(`${config.baseUrl}/api/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: data.phone,
    }),
  });

  const result = await response.json();
  return result;
};

export const verifyOtp = async (data) => {
  const response = await fetch(`${config.baseUrl}/api/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: data.phone,
      otp: data.otp,
    }),
  });

  const result = await response.json();
  return result;
};
