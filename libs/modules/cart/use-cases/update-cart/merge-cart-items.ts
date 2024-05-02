import { generateErrorResponse, successResponse } from "@response-entity";
import { mergeCartItemsBodySchema } from "../../types/update-cart";
import { mergeCart } from "@cart-adapter";

export const mergeCartItems = async (body: unknown, cartId: string) => {
  try {
    const { products } = mergeCartItemsBodySchema.parse(body);
    await mergeCart(cartId, products);
    return successResponse.OK("cart merged");
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
