import { deleteCart, getCart } from "@cart-module";
import { successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";

const GET: PagesFunction = async ({ params }) => {
  const cartId = params.id as string;
  const cart = await getCart(false, cartId);
  return successResponse.OK("Cart fetched successfully", cart);
};

const DELETE: PagesFunction = async ({ params }) => {
  const cartId = params.id as string;
  const cart = await deleteCart(cartId);
  return successResponse.OK("Cart deleted successfully", cart);
};

export const onRequest = requestHandler({ GET, DELETE });
