import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Backend the dev proxy forwards to (override with VITE_API_PROXY_TARGET).
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8790";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Listen on all interfaces and accept tunnel hostnames so the dev server is
    // reachable over a Cloudflare/ngrok tunnel (e.g. from a phone).
    host: true,
    allowedHosts: true,
    proxy: {
      // Same-origin API: the SPA calls `/api/*`, proxied to the backend. Keeps
      // local dev AND a tunnel single-origin — no CORS, and the auth cookie
      // rides along because it's the same host as the app.
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
