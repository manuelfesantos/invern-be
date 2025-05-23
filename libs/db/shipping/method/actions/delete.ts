import { shippingMethodsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const deleteShippingMethodQuery = async (id: string) =>
  db()
    .delete(shippingMethodsTable)
    .where(eq(shippingMethodsTable.id, id))
    .returning();

export const getDeleteShippingMethodAction = actionBuilder(
  deleteShippingMethodQuery,
);
