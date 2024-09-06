import { removeFromCart } from "@cart-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductId } from "@product-db";

export const removeProductFromCart: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { productId, quantity } = productIdAndQuantitySchema.parse(body);
  await validateProductId(productId);
  await removeFromCart(cartId, productId, quantity);
  return protectedSuccessResponse.OK(
    tokens,
    "product removed from cart",
    undefined,
    remember,
  );
};
