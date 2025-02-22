import { shippingTransactionsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { ShippingTransaction } from "@shipping-transaction-entity";

export const updateShippingTransaction = async (
  id: string,
  data: Partial<ShippingTransaction>,
): Promise<ShippingTransaction | undefined> => {
  const [updatedShippingTransaction] = await db()
    .update(shippingTransactionsTable)
    .set(data)
    .where(eq(shippingTransactionsTable.id, id))
    .returning()
    .execute();
  return updatedShippingTransaction;
};
