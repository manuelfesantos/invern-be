import { removeFromCart } from "@cart-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";

export const removeProductFromCart = async (body: unknown, cartId: string) => {
  try {
    const { productId, quantity } = productIdAndQuantitySchema.parse(body);
    await removeFromCart(cartId, productId, quantity);
    return successResponse.OK("product removed from cart");
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
