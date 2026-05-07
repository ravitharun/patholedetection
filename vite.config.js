import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",

      devOptions: {
        enabled: true, // enables PWA in dev
      },

      manifest: {
        id: "/",
        name: "PathoDetect",
        short_name: "PathoDetect",
        description: "PathoDetect Medical App",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#1c1c1c",
        background_color: "#ffffff",

        icons: [
          {
            src: "/icons/icar_3151535.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/car_3151535.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    https: false,
    host: true,
    port: 5173,
    allowedHosts: ["unintellectual-pily-christia.ngrok-free.dev"],
    proxy: {
      "/api": {
        target: "https://data.traffic.hereapi.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
