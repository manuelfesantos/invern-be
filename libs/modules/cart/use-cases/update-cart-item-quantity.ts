import { errors } from "@error-handling-utils";
import {
  CartOperation,
  CartOperationEnum,
  ExtendedCart,
  toCartDTO,
} from "@cart-entity";
import { isZero } from "@number-utils";
import { getCartId } from "./utils/get-cart-id";
import { extendCart } from "@extender-utils";
import { cartOperationMap } from "./operations";
import { selectProductStockAndQuantityOperation } from "./operations/select-product-stock-and-quantity";

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<ExtendedCart> => {
  const cartId = await getCartId();

  const { stock, quantity: cartQuantity } =
    await selectProductStockAndQuantityOperation(productId, cartId);

  if (quantity > stock) {
    throw errors.PRODUCT_OUT_OF_STOCK(stock);
  }

  const cartOperation = getCartOperation(quantity, cartQuantity);

  const cart = await cartOperationMap[cartOperation](
    productId,
    cartId,
    quantity,
  );

  return extendCart(toCartDTO(cart));
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
