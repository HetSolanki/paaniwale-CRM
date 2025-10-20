/* eslint-disable no-undef */
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: false,
    },
    // Define environment variables for production
    define: {
      "import.meta.env.VITE_WHATSAPP_API_VERSION": JSON.stringify(
        env.VITE_WHATSAPP_API_VERSION
      ),
      "import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID": JSON.stringify(
        env.VITE_WHATSAPP_PHONE_NUMBER_ID
      ),
      "import.meta.env.VITE_WHATSAPP_USER_ACCESS_TOKEN": JSON.stringify(
        env.VITE_WHATSAPP_USER_ACCESS_TOKEN
      ),
      "import.meta.env.VITE_CLOUD_NAME": JSON.stringify(env.VITE_CLOUD_NAME),
      "import.meta.env.VITE_CLOUD_UPLOAD_PRESET": JSON.stringify(
        env.VITE_CLOUD_UPLOAD_PRESET
      ),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        env.VITE_API_BASE_URL
      ),
    },
  };
});
