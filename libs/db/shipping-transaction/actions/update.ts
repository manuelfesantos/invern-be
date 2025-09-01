import { shippingTransactionsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import type { ShippingTransaction } from "@shipping-transaction-entity";
import { actionBuilder } from "@generics-db";

const updateShippingTransactionQuery = (
  id: string,
  data: Partial<ShippingTransaction>,
) =>
  db()
    .update(shippingTransactionsTable)
    .set(data)
    .where(eq(shippingTransactionsTable.id, id))
    .returning();

export const getUpdateShippingTransactionAction = actionBuilder(
  updateShippingTransactionQuery,
);
