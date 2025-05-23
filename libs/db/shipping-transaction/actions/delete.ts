import { shippingTransactionsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const deleteShippingTransactionQuery = (id: string) =>
  db()
    .delete(shippingTransactionsTable)
    .where(eq(shippingTransactionsTable.id, id))
    .returning();

export const getDeleteShippingTransactionAction = actionBuilder(
  deleteShippingTransactionQuery,
);
