import { addToCart, getCartById } from "@cart-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductIdAndGetStock } from "@product-db";
import { Country } from "@country-entity";
import { extendCart } from "@price-utils";

export const addProductToCart: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId: string,
  country?: Country,
): Promise<Response> => {
  const { id, quantity } = productIdAndQuantitySchema.parse(body);
  const stock = await validateProductIdAndGetStock(id, quantity);
  await addToCart(cartId, id, quantity, stock);
  const newCart = await getCartById(cartId);
  return protectedSuccessResponse.OK(
    tokens,
    "product added to cart",
    country ? extendCart(newCart, country) : newCart,
    remember,
  );
};
