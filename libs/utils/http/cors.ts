/**
 * Deliberate, allow-list-based CORS.
 *
 * Credentials are used (the refresh token is a cookie), so `Access-Control-
 * Allow-Origin` must echo a specific allowed origin — never `*`. The allow-list
 * comes from env (`FRONTEND_HOST` = storefront, `BACKOFFICE_HOST` = admin).
 *
 * Origins are passed in explicitly rather than read from the `ENV` proxy so the
 * helpers work from the first middleware (`startLogger`), which runs before
 * `setEnv`.
 */

const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "CF-Access-Client-Id",
  "CF-Access-Client-Secret",
  "country",
  "x-data-center",
].join(", ");

/** The set of allowed browser origins (storefront + backoffice). */
export const getAllowedOrigins = (env: {
  FRONTEND_HOST?: string;
  BACKOFFICE_HOST?: string;
}): string[] =>
  [env.FRONTEND_HOST, env.BACKOFFICE_HOST].filter(
    (origin): origin is string => Boolean(origin),
  );

/** The request's Origin if it is allow-listed, else undefined. */
export const resolveCorsOrigin = (
  request: Request,
  allowedOrigins: string[],
): string | undefined => {
  const origin = request.headers.get("Origin");
  return origin && allowedOrigins.includes(origin) ? origin : undefined;
};

/**
 * Add CORS headers to `response` for an allow-listed origin. Disallowed (or
 * missing) origins get no `Access-Control-Allow-Origin` header at all.
 */
export const applyCorsHeaders = (
  request: Request,
  response: Response,
  allowedOrigins: string[],
): Response => {
  const origin = resolveCorsOrigin(request, allowedOrigins);
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
    response.headers.append("Vary", "Origin");
  }
  return response;
};

/** A 204 CORS preflight response for the (allow-listed) request origin. */
export const corsPreflightResponse = (
  request: Request,
  allowedOrigins: string[],
): Response => {
  const response = new Response(null, { status: 204 });
  return applyCorsHeaders(request, response, allowedOrigins);
};
