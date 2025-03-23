import { errors } from "@error-handling-utils";
import {
  deleteProductFromCart,
  insertProductInCart,
  selectProductStockAndQuantityInCart,
  updateProductQuantityInCart,
} from "@cart-db";
import {
  Cart,
  CartOperation,
  CartOperationEnum,
  ExtendedCart,
  toCartDTO,
} from "@cart-entity";
import { isPositive, isZero } from "@number-utils";
import { getCartId } from "./utils/get-cart-id";
import { extendCart } from "@extender-utils";

const NO_QUANTITY = 0;

export const patchCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<ExtendedCart> => {
  const cartId = await getCartId();

  const { stock, quantity: cartQuantity } =
    await selectProductStockAndQuantityInCart(productId, cartId);

  if (isZero(quantity)) throw errors.INVALID_PRODUCT_QUANTITY();

  const finalQuantity = Math.max(cartQuantity + quantity, NO_QUANTITY);

  const cartOperation = getCartOperation(
    quantity,
    cartQuantity,
    finalQuantity,
    stock,
  );

  const cart = await cartOperationMap[cartOperation](
    productId,
    cartId,
    finalQuantity,
  );

  return extendCart(toCartDTO(cart));
};

const getCartOperation = (
  quantity: number,
  cartQuantity: number,
  finalQuantity: number,
  stock: number,
): CartOperation => {
  if (isZero(cartQuantity)) {
    if (isPositive(quantity)) {
      return CartOperationEnum.ADD;
    }
    throw errors.PRODUCT_NOT_IN_CART();
  }

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
  (productId: string, cartId: string, quantity: number) => Promise<Cart>
> = {
  [CartOperationEnum.ADD]: insertProductInCart,
  [CartOperationEnum.REMOVE]: deleteProductFromCart,
  [CartOperationEnum.UPDATE]: updateProductQuantityInCart,
};
