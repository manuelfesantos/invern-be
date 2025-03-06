import { paymentMethodsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const deletePaymentMethod = async (
  paymentMethodId: string,
): Promise<void> => {
  await db()
    .delete(paymentMethodsTable)
    .where(eq(paymentMethodsTable.id, paymentMethodId))
    .execute();
};
