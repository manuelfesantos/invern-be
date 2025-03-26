import { db } from "@db";
import {
  InsertShippingTransaction,
  ShippingTransaction,
} from "@shipping-transaction-entity";
import { shippingTransactionsTable } from "@schema";
import { getRandomUUID } from "@crypto-utils";

export const insertShippingTransaction = async (
  insertShippingTransaction: InsertShippingTransaction,
): Promise<ShippingTransaction> => {
  const shippingTransaction: ShippingTransaction = {
    ...insertShippingTransaction,
    id: getRandomUUID(),
  };
  const [createdShippingTransaction] = await db()
    .insert(shippingTransactionsTable)
    .values(shippingTransaction)
    .returning()
    .execute();

  return createdShippingTransaction;
};
