import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { mergeCartItemsBodySchema } from "./types/update-cart";
import { mergeCart, getCartById } from "@cart-db";
import { validateProductIds } from "@product-db";
import { errors } from "@error-handling-utils";
import { Country } from "@country-entity";
import { extendCart } from "@price-utils";

export const mergeCartItems: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId: string,
  country?: Country,
): Promise<Response> => {
  const { products } = mergeCartItemsBodySchema.parse(body);
  if (!products.length) {
    throw errors.PRODUCTS_ARE_REQUIRED();
  }
  const cart = await getCartById(cartId);
  if (cart.products?.length) {
    throw errors.CART_IS_NOT_EMPTY();
  }
  await validateProductIds(products.map((product) => product.id));
  await mergeCart(cartId, products);
  const newCart = await getCartById(cartId);
  return protectedSuccessResponse.OK(
    tokens,
    "cart merged",
    country ? extendCart(newCart, country) : newCart,
    remember,
  );
};
