import { productsTable } from "@schema";
import { db } from "@db";
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
  return db().insert(productsTable).values(insertProduct).returning({
    productId: productsTable.id,
  });
};
