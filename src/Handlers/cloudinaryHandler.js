import { config } from "@/Data/config";

export const cloudinaryHandler = async (public_id) => {
  const customer = await fetch(
    `${config.baseUrl}/api/customers/uploadfile/${public_id}`
  );

  return customer.json();
};
