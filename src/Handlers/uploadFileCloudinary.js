import { config } from "@/Data/config";

export const uploadFileCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.cloud.uploadPreset);
  formData.append("folder", "Dhandha-QR");

  const res = await fetch(
    `https://api.cloudinary.com/${config.cloud.version}/${config.cloud.name}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return res.json();
};
