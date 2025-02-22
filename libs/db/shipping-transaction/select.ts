import { shippingMethodsTable } from "@schema";
import { db } from "@db";
import { ShippingTransaction } from "@shipping-transaction-entity";
import { eq } from "drizzle-orm";

export const selectShippingTransaction = async (
  id: string,
): Promise<ShippingTransaction | undefined> => {
  return await db()
    .query.shippingTransactionsTable.findFirst({
      where: eq(shippingMethodsTable.id, id),
    })
    .execute();
};
