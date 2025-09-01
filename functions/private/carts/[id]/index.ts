import { deleteCart, getCart } from "@cart-module";
import { successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async ({ params }) => {
  const cartId = params.id as string;
  const cart = await getCart(false, cartId);
  return successResponse.OK("Cart fetched successfully", cart);
});

export const onRequestDelete = requestHandler(async ({ params }) => {
  const cartId = params.id as string;
  const cart = await deleteCart(cartId);
  return successResponse.OK("Cart deleted successfully", cart);
});
