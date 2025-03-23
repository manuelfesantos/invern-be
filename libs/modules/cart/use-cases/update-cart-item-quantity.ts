import { errors } from "@error-handling-utils";
import {
  deleteProductFromCart,
  insertProductInCart,
  selectProductQuantityInCart,
  updateProductQuantityInCart,
} from "@cart-db";
import { CartOperation, CartOperationEnum } from "@cart-entity";
import { isZero } from "@number-utils";
import { getProductStock } from "./utils/get-product-stock";
import { getCartId } from "./utils/get-cart-id";

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<string> => {
  const productStock = await getProductStock(productId);

  const cartId = await getCartId();

  if (quantity > productStock) {
    throw errors.PRODUCT_OUT_OF_STOCK(productStock);
  }

  const cartQuantity = await selectProductQuantityInCart(productId, cartId);

  if (quantity === cartQuantity) {
    return cartId;
  }

  const cartOperation = getCartOperation(quantity, cartQuantity);

  await cartOperationMap[cartOperation](productId, cartId, quantity);

  return cartId;
};

const getCartOperation = (
  quantity: number,
  cartQuantity: number,
): CartOperation => {
  if (isZero(quantity)) {
    return CartOperationEnum.REMOVE;
  }

  if (isZero(cartQuantity)) {
    return CartOperationEnum.ADD;
  }

  return CartOperationEnum.UPDATE;
};

const cartOperationMap: Record<
  CartOperation,
  (
    productId: string,
    cartId: string,
    quantity: number,
  ) => Promise<void | number>
> = {
  [CartOperationEnum.ADD]: insertProductInCart,
  [CartOperationEnum.REMOVE]: deleteProductFromCart,
  [CartOperationEnum.UPDATE]: updateProductQuantityInCart,
};
