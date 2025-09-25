import { errors } from "@error-handling-utils";
import type { ExtendedCart } from "@cart-entity";
import { toCartDTO } from "@cart-entity";
import { isZero } from "@number-utils";
import { getCartId } from "./utils/get-cart-id";
import { extendCart } from "@extender-utils";
import { cartOperationMap } from "./operations";
import { getSelectProductStockByIdAction } from "@product-db";
import { stockClient } from "@r2-adapter";

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number,
  waitUntil: ExecutionContext["waitUntil"],
): Promise<ExtendedCart> => {
  const cartId = await getCartId();

  if (isZero(quantity)) {
    const [success, cart] = await cartOperationMap.REMOVE(productId, cartId);
    if (!success) throw errors.PRODUCT_NOT_FOUND();
    return extendCart(toCartDTO(cart));
  }

  let stock: number | null | undefined = await stockClient.get(productId);
  if (stock === null) {
    stock = await getSelectProductStockByIdAction(productId).run();
    if (stock === undefined) throw errors.PRODUCT_NOT_FOUND();
    waitUntil(stockClient.setKV(productId, stock));
  }

  if (quantity > stock) {
    throw errors.PRODUCT_OUT_OF_STOCK(stock);
  }

  const cart = await cartOperationMap.UPSERT(productId, cartId, quantity);
  return extendCart(toCartDTO(cart));
};
