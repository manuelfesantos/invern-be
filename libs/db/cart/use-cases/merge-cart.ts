import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { ProductIdAndQuantity } from "@product-entity";

export const mergeCart = async (
  cartId: string,
  items: ProductIdAndQuantity[],
): Promise<void> => {
  await db()
    .insert(productsToCartsTable)
    .values(items.map((item) => ({ ...item, cartId })));
};
