import { Cart, CartOperation, CartOperationEnum } from "@cart-entity";
import { addProductOperation } from "./add-product";
import { removeProductOperation } from "./remove-product";
import { updateProductQuantityOperation } from "./update-product-quantity";

export const cartOperationMap: Record<
  CartOperation,
  (productId: string, cartId: string, quantity: number) => Promise<Cart>
> = {
  [CartOperationEnum.ADD]: addProductOperation,
  [CartOperationEnum.REMOVE]: removeProductOperation,
  [CartOperationEnum.UPDATE]: updateProductQuantityOperation,
};
