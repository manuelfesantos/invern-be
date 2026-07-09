import createClient, { type Client, type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

// Re-export the generated contract types so consumers get request/response
// shapes without importing the raw schema file.
export type { paths, components, operations } from "./schema";

/** A typed client bound to this API's OpenAPI paths. */
export type ApiClient = Client<paths>;

export interface ApiClientOptions {
  /** Base URL of the API (e.g. `http://localhost:8790` or `https://api.invernspirit.com`). */
  baseUrl: string;
  /**
   * Returns the current admin JWT access token, or a falsy value when signed
   * out. Called per-request, so the client always sends the latest token —
   * plug this into the backoffice auth store (Feature 16). The refresh cookie
   * (`s_r`) rides along automatically via `credentials: "include"`.
   */
  getToken?: () => string | null | undefined;
}

/**
 * Builds a typed API client from the generated OpenAPI contract. Every call is
 * checked at compile time against `swagger.yaml`: unknown paths, wrong methods,
 * or mismatched request/response shapes are type errors.
 */
export function createApiClient({
  baseUrl,
  getToken,
}: ApiClientOptions): ApiClient {
  const client = createClient<paths>({
    baseUrl,
    // Send the s_r refresh cookie on /private/* calls (admin auth is JWT + cookie).
    credentials: "include",
  });

  if (getToken) {
    const authMiddleware: Middleware = {
      onRequest({ request }) {
        const token = getToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        return request;
      },
    };
    client.use(authMiddleware);
  }

  return client;
}
