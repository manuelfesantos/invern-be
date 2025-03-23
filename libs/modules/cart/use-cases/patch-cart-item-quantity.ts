import { errors } from "@error-handling-utils";
import {
  deleteProductFromCart,
  insertProductInCart,
  selectProductQuantityInCart,
  updateProductQuantityInCart,
} from "@cart-db";
import { CartOperation, CartOperationEnum } from "@cart-entity";
import { isPositive, isZero } from "@number-utils";
import { getCartId } from "./utils/get-cart-id";
import { getProductStock } from "./utils/get-product-stock";

const NO_QUANTITY = 0;

export const patchCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<{ id: string; newQuantity: number }> => {
  const productStock = await getProductStock(productId);

  const cartId = await getCartId();

  if (isZero(quantity)) throw errors.INVALID_PRODUCT_QUANTITY();

  const cartQuantity = await selectProductQuantityInCart(productId, cartId);

  const cartOperation = getCartOperation(quantity, cartQuantity, productStock);

  const newQuantity = await cartOperationMap[cartOperation](
    productId,
    cartId,
    quantity,
  );

  return {
    id: cartId,
    newQuantity,
  };
};

const getCartOperation = (
  quantity: number,
  cartQuantity: number,
  stock: number,
): CartOperation => {
  if (isZero(cartQuantity)) {
    if (isPositive(quantity)) {
      return CartOperationEnum.ADD;
    }
    throw errors.PRODUCT_NOT_IN_CART();
  }

  const finalQuantity = Math.max(cartQuantity + quantity, NO_QUANTITY);

  if (isZero(finalQuantity)) {
    return CartOperationEnum.REMOVE;
  }

  if (isPositive(quantity) && finalQuantity > stock) {
    throw errors.PRODUCT_OUT_OF_STOCK(stock);
  }

  return CartOperationEnum.UPDATE;
};

const cartOperationMap: Record<
  CartOperation,
  (productId: string, cartId: string, quantity: number) => Promise<number>
> = {
  [CartOperationEnum.ADD]: async (
    productId: string,
    cartId: string,
    quantity: number,
  ) => {
    await insertProductInCart(productId, cartId, quantity);
    return quantity;
  },
  [CartOperationEnum.REMOVE]: async (productId: string, cartId: string) => {
    await deleteProductFromCart(productId, cartId);
    return NO_QUANTITY;
  },
  [CartOperationEnum.UPDATE]: async (
    productId: string,
    cartId: string,
    quantity: number,
  ) => {
    return await updateProductQuantityInCart(productId, cartId, quantity);
  },
};
