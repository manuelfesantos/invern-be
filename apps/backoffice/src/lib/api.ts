import { createApiClient } from "@invern/api-client";
import { config } from "./config";
import { authStore } from "./auth-store";

// The one typed client for the app: base URL from env, JWT injected per-request
// from the auth store (empty until Feature 16 wires login).
export const api = createApiClient({
  baseUrl: config.apiBaseUrl,
  getToken: () => authStore.getToken(),
});
