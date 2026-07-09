// Environment-driven — no hardcoded hosts. Local dev defaults to the worker's
// `npm start` port; preview/prod set VITE_API_BASE_URL at build time.
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8790",
};
