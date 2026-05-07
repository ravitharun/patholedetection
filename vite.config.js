import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",

  plugins: [react(), tailwindcss()],

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
