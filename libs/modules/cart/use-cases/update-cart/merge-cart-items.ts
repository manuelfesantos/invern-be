import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { mergeCartItemsBodySchema } from "../../types/update-cart";
import { getCartById, mergeCart } from "@cart-adapter";

export const mergeCartItems = async (
  body: unknown,
  cartId: string,
): Promise<Response> => {
  try {
    const { products } = mergeCartItemsBodySchema.parse(body);
    if (!products.length) {
      return errorResponse.BAD_REQUEST("products are required");
    }
    const cart = await getCartById(cartId);
    if (cart.products.length) {
      return errorResponse.BAD_REQUEST("cart is not empty");
    }
    await mergeCart(cartId, products);
    return successResponse.OK("cart merged");
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
