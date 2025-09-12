import { db } from "@db";
import type {
  InsertShippingTransaction,
  ShippingTransaction,
} from "@shipping-transaction-entity";
import { shippingTransactionsTable } from "@schema";
import { actionBuilder } from "@generics-db";

const insertShippingTransactionQuery = (
  insertShippingTransaction: InsertShippingTransaction,
) => {
  const dateTime = new Date().toISOString();
  const shippingTransaction: ShippingTransaction = {
    ...insertShippingTransaction,
    createdAt: dateTime,
    lastModifiedAt: dateTime,
  };
  return db()
    .insert(shippingTransactionsTable)
    .values(shippingTransaction)
    .returning();
};

export const getInsertShippingTransactionAction = actionBuilder(
  insertShippingTransactionQuery,
);
