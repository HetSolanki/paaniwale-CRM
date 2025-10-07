export const config = {
  cloud: {
    name: import.meta.env.VITE_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUD_UPLOAD_PRESET,
  },
  whatsapp: {
    version: import.meta.env.VITE_WHATSAPP_API_VERSION,
    phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
    authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_USER_ACCESS_TOKEN}`,
  },
};
