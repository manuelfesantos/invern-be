import { getCartById, removeFromCart } from "@cart-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductId } from "@product-db";
import { Country } from "@country-entity";
import { extendCart } from "@price-utils";

export const removeProductFromCart: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId: string,
  country?: Country,
): Promise<Response> => {
  const { id, quantity } = productIdAndQuantitySchema.parse(body);
  await validateProductId(id);
  await removeFromCart(cartId, id, quantity);
  const newCart = await getCartById(cartId);
  return protectedSuccessResponse.OK(
    tokens,
    "product removed from cart",
    country ? extendCart(newCart, country) : newCart,
    remember,
  );
};
