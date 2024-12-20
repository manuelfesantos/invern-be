import { addToCart } from "@cart-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductIdAndGetStock } from "@product-db";

export const addProductToCart: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { id, quantity } = productIdAndQuantitySchema.parse(body);
  const stock = await validateProductIdAndGetStock(id, quantity);
  await addToCart(cartId, id, quantity, stock);
  return protectedSuccessResponse.OK(
    tokens,
    "product added to cart",
    undefined,
    remember,
  );
};
