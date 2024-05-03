import { addProductToCart } from "./add-product-to-cart";
import { cartActionSchema } from "../../types/update-cart";
import {
  buildErrorResponse,
  errorResponse,
  generateErrorResponse,
} from "@response-entity";
import { HttpParams } from "@http-entity";
import { removeProductFromCart } from "./remove-product-from-cart";
import { mergeCartItems } from "./merge-cart-items";
import { validateCartId } from "../../../../adapters/cart/validate-cart-id";

export const updateCart = async (
  body: unknown,
  action: string,
  cartId: HttpParams,
): Promise<Response> => {
  try {
    await validateCartId(cartId as string);

    return await actionMapper[cartActionSchema.parse(action)](
      body,
      cartId as string,
    );
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};

const actionMapper = {
  add: addProductToCart,
  remove: removeProductFromCart,
  merge: mergeCartItems,
};
