import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { mergeCartItemsBodySchema } from "./types/update-cart";
import { mergeCart, getCartById } from "@cart-db";
import { validateProductIds } from "@product-db";
import { errors } from "@error-handling-utils";

export const mergeCartItems: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { products } = mergeCartItemsBodySchema.parse(body);
  if (!products.length) {
    throw errors.PRODUCTS_ARE_REQUIRED();
  }
  const cart = await getCartById(cartId);
  if (cart.products?.length) {
    throw errors.CART_IS_NOT_EMPTY();
  }
  await validateProductIds(products.map((product) => product.productId));
  await mergeCart(cartId, products);
  return protectedSuccessResponse.OK(
    tokens,
    "cart merged",
    undefined,
    remember,
  );
};
