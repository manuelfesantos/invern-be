import { successResponse } from "@response-entity";
import { mergeCartItemsBodySchema } from "./types/update-cart";
import { getCartById, mergeCart } from "@cart-adapter";
import { validateProductIds } from "@product-adapter";
import { errors } from "@error-handling-utils";

export const mergeCartItems = async (
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { products } = mergeCartItemsBodySchema.parse(body);
  if (!products.length) {
    throw errors.PRODUCTS_ARE_REQUIRED();
  }
  const cart = await getCartById(cartId);
  if (cart.products.length) {
    throw errors.CART_IS_NOT_EMPTY();
  }
  await validateProductIds(products.map((product) => product.productId));
  await mergeCart(cartId, products);
  return successResponse.OK("cart merged");
};
