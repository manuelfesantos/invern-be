// Deprecated for now

// import { errors } from "@error-handling-utils";
// import {
//   CartOperation,
//   CartOperationEnum,
//   ExtendedCart,
//   toCartDTO,
// } from "@cart-entity";
// import { isPositive, isZero } from "@number-utils";
// import { getCartId } from "./utils/get-cart-id";
// import { extendCart } from "@extender-utils";
// import { cartOperationMap } from "./operations";
// import { selectProductStockAndQuantityOperation }
// from "./operations/select-product-stock-and-quantity";
//
// const NO_QUANTITY = 0;
//
// export const patchCartItemQuantity = async (
//   productId: string,
//   quantity: number,
// ): Promise<ExtendedCart> => {
//   const cartId = await getCartId();
//
//   const { stock, quantity: cartQuantity } =
//     await selectProductStockAndQuantityOperation(productId, cartId);
//
//   if (isZero(quantity)) throw errors.INVALID_PRODUCT_QUANTITY();
//
//   const finalQuantity = Math.max(cartQuantity + quantity, NO_QUANTITY);
//
//   if (finalQuantity > stock) throw errors.PRODUCT_OUT_OF_STOCK(stock);
//
//   const cartOperationType = getCartOperationType(
//     quantity,
//     cartQuantity,
//     finalQuantity,
//     stock,
//   );
//
//   const cart = await cartOperationMap[cartOperationType](
//     productId,
//     cartId,
//     finalQuantity,
//   );
//
//   return extendCart(toCartDTO(cart));
// };
//
// const getCartOperationType = (
//   quantity: number,
//   cartQuantity: number,
//   finalQuantity: number,
//   stock: number,
// ): CartOperation => {
//   if (isZero(cartQuantity)) {
//     if (isPositive(quantity)) {
//       return CartOperationEnum.ADD;
//     }
//     throw errors.PRODUCT_NOT_IN_CART();
//   }
//
//   if (isZero(finalQuantity)) {
//     return CartOperationEnum.REMOVE;
//   }
//
//   if (isPositive(quantity) && finalQuantity > stock) {
//     throw errors.PRODUCT_OUT_OF_STOCK(stock);
//   }
//
//   return CartOperationEnum.UPDATE;
// };
