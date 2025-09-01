import type { InsertProduct } from "@product-entity";
import { productsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const updateProductQuery = (
  productId: string,
  changes: Partial<InsertProduct>,
) =>
  db()
    .update(productsTable)
    .set(changes)
    .where(eq(productsTable.id, productId));

export const getUpdateProductAction = actionBuilder(updateProductQuery);
