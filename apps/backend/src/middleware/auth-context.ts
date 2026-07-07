import type { MiddlewareHandler } from "hono";
import { getCredentials } from "@jwt-utils";
import { contextStore } from "@context-utils";
import { logCredentials } from "@logger-utils";
import type { HonoEnv } from "../types/hono";

/**
 * Extracts the caller's credentials (anonymous or logged-in) from the request
 * headers and lays them onto the request context. Applied only to the protected
 * public sub-resources (cart, checkout, orders, user, oauth) — matching the
 * `protectedEndpoints` gate in the Pages country middleware. Throws UNAUTHORIZED
 * (→ 401) when tokens are missing/invalid.
 */
export const authContext: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const {
    cartId,
    userId,
    accessToken,
    refreshToken,
    remember,
    address,
    userDetails,
    shippingMethod,
    customerEmail,
  } = await getCredentials(c.req.raw.headers);

  logCredentials(cartId, userId);

  const ctx = contextStore.context;
  ctx.cartId = cartId;
  ctx.userId = userId;
  ctx.accessToken = accessToken;
  ctx.refreshToken = refreshToken;
  ctx.remember = remember;
  ctx.address = address;
  ctx.userDetails = userDetails;
  ctx.shippingMethodId = shippingMethod;
  ctx.customerEmail = customerEmail;

  return next();
};
