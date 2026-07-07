import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import * as z from "zod";
import type { HonoEnv } from "../../types/hono";
import { authContext } from "../../middleware/auth-context";
import { protectedSuccessResponse } from "@response-entity";
import {
  deleteShippingMethodCookieFromResponse,
  getBodyFromRequest,
  getCartIdCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { getCart, removeCartItem, updateCartItemQuantity } from "@cart-module";
import { contextStore } from "@context-utils";

const cart = new Hono<HonoEnv>();

cart.use("*", authContext);

const quantitySchema = z.object({ quantity: z.int().nonnegative() });

/** Anonymous callers need their cart id echoed back as a cookie (success only). */
const withCartIdCookie = (response: Response): Response => {
  const { isLoggedOut, cartId } = contextStore.context;
  if (isLoggedOut && cartId) {
    setCookieInResponse(response, getCartIdCookieHeader(cartId));
  }
  return response;
};

/**
 * Mirrors the Pages handler's `postProcess`: the shipping-method cookie is
 * cleared on the final response of every item mutation — success OR error
 * (Hono's onError has already set `c.res` by the time this runs after next()).
 */
const clearShippingMethodCookie: MiddlewareHandler<HonoEnv> = async (
  c,
  next,
) => {
  await next();
  deleteShippingMethodCookieFromResponse(c.res);
};

cart.get("/", async () =>
  protectedSuccessResponse.OK("success getting cart", await getCart(true)),
);

cart.put("/items/:id", clearShippingMethodCookie, async (c) => {
  const { quantity } = quantitySchema.parse(
    await getBodyFromRequest(c.req.raw),
  );
  const updated = await updateCartItemQuantity(
    c.req.param("id"),
    quantity,
    c.executionCtx.waitUntil.bind(c.executionCtx),
  );
  return withCartIdCookie(
    protectedSuccessResponse.OK(
      "Successfully updated product quantity in cart",
      updated,
    ),
  );
});

cart.delete("/items/:id", clearShippingMethodCookie, async (c) => {
  const updated = await removeCartItem(c.req.param("id"));
  return withCartIdCookie(
    protectedSuccessResponse.OK("successfully removed item from cart", updated),
  );
});

export default cart;
