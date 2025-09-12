import { protectedSuccessResponse } from "@response-entity";
import {
  deleteShippingMethodCookieFromResponse,
  getBodyFromRequest,
  getCartIdCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import * as z from "zod";
import { updateCartItemQuantity, removeCartItem } from "@cart-module";
import type { RequestHandlerProps } from "@decorator-utils";
import { requestHandler } from "@decorator-utils";

import { contextStore } from "@context-utils";

const cartItemUpdateBodySchema = z.object({
  quantity: z.int().nonnegative(),
});

const handlerOptions: RequestHandlerProps = {
  postProcess: (response) => {
    deleteShippingMethodCookieFromResponse(response);
    return response;
  },
};

export const onRequestPut = requestHandler(async ({ request, params }) => {
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
}, handlerOptions);

// Deprecated for now
// export const onRequestPatch = requestHandler(async ({ request, params }) => {
//   const { id: productId } = params;
//
//   const body = await getBodyFromRequest(request);
//   const { quantity } = cartItemUpdateBodySchema.parse(body);
//
//   const cart = await patchCartItemQuantity(productId as string, quantity);
//
//   const response = protectedSuccessResponse.OK(
//     "Successfully updated product quantity in cart",
//     cart,
//   );
//
//   if (contextStore.context.isLoggedOut && contextStore.context.cartId) {
//     setCookieInResponse(
//       response,
//       getCartIdCookieHeader(contextStore.context.cartId),
//     );
//   }
//   return response;
// };

export const onRequestDelete = requestHandler(async ({ params }) => {
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
}, handlerOptions);
