import { api } from "../api";
import { authStore } from "../auth-store";
import type { components } from "@invern/api-client";

export type AdminUser = components["schemas"]["AdminUser"];

// Login is country-scoped in the backend; the backoffice is global admin, so it
// uses one fixed country context (configurable) purely to reach the auth routes.
const COUNTRY = import.meta.env.VITE_LOGIN_COUNTRY ?? "PT";
const params = { path: { countryCode: COUNTRY } } as const;

// The access token rides in the response envelope, not the typed data schema.
const tokenFrom = (body: unknown): string | undefined =>
  (body as { accessToken?: string } | null | undefined)?.accessToken;

// Bootstrap an anonymous session: gets an anon access token + sets the s_r
// refresh cookie (credentials: "include" in the client).
async function bootstrapAnon(): Promise<void> {
  authStore.setToken(null);
  const { data, error } = await api.GET(
    "/public/countries/{countryCode}/config",
    { params },
  );
  authStore.setToken((error ? undefined : tokenFrom(data)) ?? null);
}

/** The current admin, or null if the session isn't an authenticated admin. */
export async function fetchMe(): Promise<AdminUser | null> {
  const { data, error } = await api.GET("/private/me");
  if (error || !data) return null;
  return data.data ?? null;
}

export async function login(
  email: string,
  password: string,
): Promise<AdminUser> {
  await bootstrapAnon();
  const { data, error, response } = await api.POST(
    "/public/countries/{countryCode}/user/login",
    { params, body: { email, password, remember: true } },
  );
  if (error || !data) {
    authStore.setToken(null);
    throw new Error(
      response.status === 429
        ? "Too many attempts — try again shortly."
        : "Invalid email or password.",
    );
  }
  const token = tokenFrom(data);
  if (!token) {
    authStore.setToken(null);
    throw new Error("Login failed.");
  }
  authStore.setToken(token);

  // Confirm ADMIN (and load identity). Non-admins get a 403 here.
  const me = await fetchMe();
  if (!me) {
    authStore.setToken(null);
    throw new Error("This account isn't an admin.");
  }
  return me;
}

/** Silent restore via the s_r cookie: config re-issues a logged-in token. */
export async function refreshSession(): Promise<AdminUser | null> {
  const { data, error } = await api.GET(
    "/public/countries/{countryCode}/config",
    { params },
  );
  const token = error ? undefined : tokenFrom(data);
  if (!token) {
    authStore.setToken(null);
    return null;
  }
  authStore.setToken(token);
  return fetchMe(); // null when the restored token is anon (not an admin)
}

export async function logout(): Promise<void> {
  try {
    await api.POST("/public/countries/{countryCode}/user/logout", { params });
  } catch {
    // best-effort server-side revoke; clear locally regardless
  }
  authStore.setToken(null);
}
