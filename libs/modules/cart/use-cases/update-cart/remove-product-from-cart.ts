import { removeFromCart } from "@cart-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";

export const removeProductFromCart = async (
  body: unknown,
  cartId: string,
): Promise<Response> => {
  try {
    const { productId, quantity } = productIdAndQuantitySchema.parse(body);
    await removeFromCart(cartId, productId, quantity);
    return successResponse.OK("product removed from cart");
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
