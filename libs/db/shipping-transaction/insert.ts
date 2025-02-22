import { db } from "@db";
import {
  InsertShippingTransaction,
  ShippingTransaction,
} from "@shipping-transaction-entity";
import { shippingTransactionsTable } from "@schema";
import { getRandomUUID } from "@crypto-utils";
import { getDateTime } from "@timer-utils";

export const insertShippingTransaction = async (
  insertShippingTransaction: InsertShippingTransaction,
): Promise<ShippingTransaction> => {
  const shippingTransaction: ShippingTransaction = {
    ...insertShippingTransaction,
    createdAt: getDateTime(),
    updatedAt: getDateTime(),
    id: getRandomUUID(),
  };
  const [createdShippingTransaction] = await db()
    .insert(shippingTransactionsTable)
    .values(shippingTransaction)
    .returning()
    .execute();

  return createdShippingTransaction;
};
