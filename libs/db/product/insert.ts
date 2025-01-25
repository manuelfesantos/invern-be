import { productsTable } from "@schema";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { InsertProduct } from "@product-entity";
import { getRandomUUID } from "@crypto-utils";

export const insertProduct = async (
  product: InsertProduct,
): Promise<
  {
    productId: string;
  }[]
> => {
  const insertProduct = {
    ...product,
    id: getRandomUUID(),
  };
  return (contextStore.context.transaction ?? db())
    .insert(productsTable)
    .values(insertProduct)
    .returning({
      productId: productsTable.id,
    });
};
