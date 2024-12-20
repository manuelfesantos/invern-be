import { db } from "@db";
import { productsToOrdersTable } from "@schema";
import { ProductIdAndQuantity } from "@product-entity";

export const addToOrder = async (
  products: ProductIdAndQuantity[],
  orderId: string,
): Promise<void> => {
  await db()
    .insert(productsToOrdersTable)
    .values(
      products.map(({ id, quantity }) => ({
        orderId,
        productId: id,
        quantity,
      })),
    );
};
