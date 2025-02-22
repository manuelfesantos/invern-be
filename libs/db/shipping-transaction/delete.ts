import { shippingTransactionsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const deleteShippingTransaction = async (id: string): Promise<void> => {
  await db()
    .delete(shippingTransactionsTable)
    .where(eq(shippingTransactionsTable.id, id))
    .execute();
};
