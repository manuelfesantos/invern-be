import { CartOperationEnum } from "@cart-entity";
import { addProductOperation } from "./add-product";
import { removeProductOperation } from "./remove-product";
import { updateProductQuantityOperation } from "./update-product-quantity";
import { upsertProductQuantityOperation } from "./upsert-product-quantity";

export const cartOperationMap = {
  [CartOperationEnum.ADD]: addProductOperation,
  [CartOperationEnum.REMOVE]: removeProductOperation,
  [CartOperationEnum.UPDATE]: updateProductQuantityOperation,
  [CartOperationEnum.UPSERT]: upsertProductQuantityOperation,
} as const;
