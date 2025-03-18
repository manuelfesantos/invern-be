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
  getCart,
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

  const cartIdPromise = updateCartItemQuantity(productId as string, quantity);
  const cart = await getCart();

  cart.products = cart.products.map((product) => {
    if (product.id === productId) {
      product.quantity = quantity;
    }
    return product;
  });

  const response = protectedSuccessResponse.OK(
    "Successfully updated product quantity in cart",
    cart,
  );

  if (contextStore.context.isLoggedOut) {
    setCookieInResponse(response, getCartIdCookieHeader(await cartIdPromise));
  }

  return response;
};

const PATCH: PagesFunction = async ({ request, params }) => {
  const { id: productId } = params;

  const body = await getBodyFromRequest(request);
  const { quantity } = cartItemUpdateBodySchema.parse(body);

  const patchCartItemQuantityPromise = patchCartItemQuantity(
    productId as string,
    quantity,
  );
  const cartPromise = getCart();

  const [{ id: cartId, newQuantity }, cart] = await Promise.all([
    patchCartItemQuantityPromise,
    cartPromise,
  ]);

  cart.products = cart.products.map((product) => {
    if (product.id === productId) {
      product.quantity = newQuantity;
    }
    return product;
  });

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

  const cartIdPromise = removeCartItem(productId as string);

  const cart = await getCart();

  cart.products = cart.products.filter((product) => product.id !== productId);

  const response = protectedSuccessResponse.OK(
    "successfully removed item from cart",
    cart,
  );

  if (contextStore.context.isLoggedOut) {
    setCookieInResponse(response, getCartIdCookieHeader(await cartIdPromise));
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
