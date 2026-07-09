import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// API base URL is environment-driven (VITE_API_BASE_URL) — no hardcoded hosts.
// See .env.example and the per-env .env files.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
