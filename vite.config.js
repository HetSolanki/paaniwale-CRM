/* eslint-disable no-undef */
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "apple-icon-180.png",
          "manifest-icon-192.maskable.png",
          "manifest-icon-512.maskable.png",
        ],
        manifest: {
          name: "Paaniwale - Water Delivery",
          short_name: "Paaniwale",
          description: "Track water bottles online",
          theme_color: "#2196F3",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          icons: [
            {
              src: "/apple-icon-180.png",
              sizes: "180x180",
              type: "image/png",
            },
            {
              src: "/manifest-icon-192.maskable.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/manifest-icon-512.maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot,json}",
          ],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "cloudinary-images",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/unpkg\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "cdn-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/api"),
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 5, // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                backgroundSync: {
                  name: "api-queue",
                  options: {
                    maxRetentionTime: 24 * 60, // Retry for up to 24 hours
                  },
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "google-fonts-stylesheets",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: "module",
        },
      }),
    ],
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
