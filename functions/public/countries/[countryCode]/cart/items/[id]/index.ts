import { protectedSuccessResponse } from "@response-entity";
import {
  getBodyFromRequest,
  getCartIdCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { z } from "zod";
import { integerSchema } from "@global-entity";
import { updateCartItemQuantity, removeCartItem, getCart } from "@cart-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { contextStore } from "@context-utils";

const cartItemUpdateBodySchema = z.object({
  quantity: integerSchema("cart item quantity"),
});

const PUT: PagesFunction = async ({ request, params }) => {
  const { id: productId } = params;

  const body = await getBodyFromRequest(request);
  const { quantity } = cartItemUpdateBodySchema.parse(body);
  const cartId = await updateCartItemQuantity(productId as string, quantity);
  const cart = await getCart();
  const response = protectedSuccessResponse.OK(
    "Successfully updated product quantity in cart",
    cart,
  );

  if (contextStore.context.isLoggedOut) {
    setCookieInResponse(response, getCartIdCookieHeader(cartId));
  }
  return response;
};

const DELETE: PagesFunction = async ({ params }) => {
  const { id: productId } = params;

  const cartId = await removeCartItem(productId as string);

  const cart = await getCart();

  const response = protectedSuccessResponse.OK(
    "successfully removed item from cart",
    cart,
  );

  if (contextStore.context.isLoggedOut) {
    setCookieInResponse(response, getCartIdCookieHeader(cartId));
  }

  return response;
};

export const onRequest = requestHandler({ PUT, DELETE });
