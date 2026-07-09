// Dev + tunnel: same-origin via the Vite `/api` proxy (see vite.config.ts) — no
// CORS, cookies just work. Prod sets VITE_API_BASE_URL to the absolute API URL.
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
};
