import { removeFromCart } from "@cart-db";
import { successResponse } from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductId } from "@product-db";

export const removeProductFromCart = async (
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { productId, quantity } = productIdAndQuantitySchema.parse(body);
  await validateProductId(productId);
  await removeFromCart(cartId, productId, quantity);
  return successResponse.OK("product removed from cart");
};
