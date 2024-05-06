import { removeFromCart } from "@cart-adapter";
import { successResponse } from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductId } from "@product-adapter";

export const removeProductFromCart = async (
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { productId, quantity } = productIdAndQuantitySchema.parse(body);
  await validateProductId(productId);
  await removeFromCart(cartId, productId, quantity);
  return successResponse.OK("product removed from cart");
};
