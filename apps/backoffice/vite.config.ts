import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Backend the proxy forwards to (override with VITE_API_PROXY_TARGET).
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8790";

// Same-origin API: the SPA calls `/api/*`, proxied to the backend. Keeps local
// dev AND a tunnel single-origin — no CORS, and the auth cookie rides along
// because it's the same host as the app. Shared by dev (`server`) and the
// built-app server (`preview`), which is what the tunnel serves for reliable
// remote/phone access (no HMR or module cache to go stale).
const proxy = {
  "/api": {
    target: API_TARGET,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ""),
  },
};

// Listen on all interfaces and accept tunnel hostnames so the server is
// reachable over a Cloudflare/ngrok tunnel (e.g. from a phone).
const shared = { port: 5173, host: true, allowedHosts: true, proxy } as const;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: shared,
  preview: shared,
});
