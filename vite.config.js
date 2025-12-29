import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "PathoDetect",
        short_name: "PathoDetect",
        start_url: "/",
        display: "standalone",
        theme_color: "#1c1c1cff",
        background_color: "#ffffff",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      }

    }),
  ],

  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "unintellectual-pily-christia.ngrok-free.dev",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
