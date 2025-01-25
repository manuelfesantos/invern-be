import { db } from "@db";
import { contextStore } from "@context-utils";
import { productsToOrdersTable } from "@schema";
import { ProductIdAndQuantity } from "@product-entity";

export const addToOrder = async (
  products: ProductIdAndQuantity[],
  orderId: string,
): Promise<void> => {
  await (
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    db()
  )
    .insert(productsToOrdersTable)
    .values(
      products.map(({ id, quantity }) => ({
        orderId,
        productId: id,
        quantity,
      })),
    );
};
