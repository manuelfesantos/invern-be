import { addToCart } from "@cart-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";

export const addProductToCart = async (
  body: unknown,
  cartId: string,
): Promise<Response> => {
  try {
    const { productId, quantity } = productIdAndQuantitySchema.parse(body);
    await addToCart(cartId, productId, quantity);
    return successResponse.OK("product added to cart");
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
