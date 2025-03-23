import { protectedSuccessResponse } from "@response-entity";
import {
  deleteShippingMethodCookieFromResponse,
  getBodyFromRequest,
  getCartIdCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { z } from "zod";
import { integerSchema } from "@global-entity";
import {
  patchCartItemQuantity,
  updateCartItemQuantity,
  removeCartItem,
} from "@cart-module";
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

  const cart = await updateCartItemQuantity(productId as string, quantity);

  const response = protectedSuccessResponse.OK(
    "Successfully updated product quantity in cart",
    cart,
  );

  if (contextStore.context.isLoggedOut && contextStore.context.cartId) {
    setCookieInResponse(
      response,
      getCartIdCookieHeader(contextStore.context.cartId),
    );
  }

  return response;
};

const PATCH: PagesFunction = async ({ request, params }) => {
  const { id: productId } = params;

  const body = await getBodyFromRequest(request);
  const { quantity } = cartItemUpdateBodySchema.parse(body);

  const cart = await patchCartItemQuantity(productId as string, quantity);

  const response = protectedSuccessResponse.OK(
    "Successfully updated product quantity in cart",
    cart,
  );

  if (contextStore.context.isLoggedOut && contextStore.context.cartId) {
    setCookieInResponse(
      response,
      getCartIdCookieHeader(contextStore.context.cartId),
    );
  }
  return response;
};

const DELETE: PagesFunction = async ({ params }) => {
  const { id: productId } = params;

  const cart = await removeCartItem(productId as string);

  const response = protectedSuccessResponse.OK(
    "successfully removed item from cart",
    cart,
  );

  if (contextStore.context.isLoggedOut && contextStore.context.cartId) {
    setCookieInResponse(
      response,
      getCartIdCookieHeader(contextStore.context.cartId),
    );
  }

  return response;
};

export const onRequest = requestHandler(
  { PUT, DELETE, PATCH },
  {
    postProcess: (response) => {
      deleteShippingMethodCookieFromResponse(response);
      return response;
    },
  },
);
