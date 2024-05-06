import { addProductToCart } from "./add-product-to-cart";
import { cartActionSchema } from "../../types/update-cart";
import { HttpParams } from "@http-entity";
import { removeProductFromCart } from "./remove-product-from-cart";
import { mergeCartItems } from "./merge-cart-items";
import { validateCartId } from "@cart-adapter";

const actionMapper = {
  add: addProductToCart,
  remove: removeProductFromCart,
  merge: mergeCartItems,
};

export const updateCart = async (
  body: unknown,
  action: string,
  cartId: HttpParams,
): Promise<Response> => {
  await validateCartId(cartId as string);

  return await actionMapper[cartActionSchema.parse(action)](
    body,
    cartId as string,
  );
};
