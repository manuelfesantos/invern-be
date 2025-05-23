import { db } from "@db";
import { productsTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const deleteProductQuery = (productId: string) =>
  db().delete(productsTable).where(eq(productsTable.id, productId));

export const getDeleteProductAction = actionBuilder(deleteProductQuery);
