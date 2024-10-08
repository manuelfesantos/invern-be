export const getCookieHeader = (
  name: string,
  value: string,
  maxAge: number,
  isSecure: boolean = true,
  isHttpOnly: boolean = true,
  isSameSite: boolean = true,
  domain: string = "invernspirit.com",
  path: string = "/",
): string =>
  `${name}=${value}; Max-Age=${maxAge}; ${isSecure ? "Secure" : ""}; ${isHttpOnly ? "HttpOnly" : ""}; ${isSameSite ? "SameSite=Strict" : ""}; ${domain ? `Domain=${domain}` : ""}; ${path ? `Path=${path}` : ""}`;
