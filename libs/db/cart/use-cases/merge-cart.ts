import { db } from "@db";
import { contextStore } from "@context-utils";
import { productsToCartsTable } from "@schema";
import { ProductIdAndQuantity } from "@product-entity";

export const mergeCart = async (
  cartId: string,
  items: ProductIdAndQuantity[],
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .insert(productsToCartsTable)
    .values(
      items.map(({ id, quantity }) => ({ quantity, productId: id, cartId })),
    );
};
