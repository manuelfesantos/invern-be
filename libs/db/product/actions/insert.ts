import { productsTable } from "@schema";
import { db } from "@db";
import type { InsertProduct } from "@product-entity";
import { getRandomUUID } from "@crypto-utils";
import { actionBuilder } from "@generics-db";

const insertProductQuery = (product: InsertProduct) => {
  const insertProduct = {
    ...product,
    id: getRandomUUID(),
  };
  return db().insert(productsTable).values(insertProduct).returning({
    productId: productsTable.id,
  });
};

export const getInsertProductAction = actionBuilder(insertProductQuery);
