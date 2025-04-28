import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <-- ADD THIS
    },
  },
  server: {
    allowedHosts: ["7895-42-105-9-195.ngrok-free.app"],
  },
});
