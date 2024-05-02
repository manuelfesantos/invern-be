import { addProductToCart } from "./add-product-to-cart";
import { cartActionSchema } from "../../types/update-cart";
import { generateErrorResponse } from "@response-entity";
import { HttpParams } from "@http-entity";
import { removeProductFromCart } from "./remove-product-from-cart";
import { mergeCartItems } from "./merge-cart-items";

export const updateCart = async (
  body: unknown,
  action: string,
  cartId: HttpParams,
) => {
  try {
    return await actionMapper[cartActionSchema.parse(action)](
      body,
      cartId as string,
    );
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};

const actionMapper = {
  add: addProductToCart,
  remove: removeProductFromCart,
  merge: mergeCartItems,
};
