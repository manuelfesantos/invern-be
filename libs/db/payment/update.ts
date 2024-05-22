import { InsertPayment } from "@payment-entity";
import { db } from "@db";
import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";

export const updatePayment = async (
  paymentId: string,
  changes: Partial<InsertPayment>,
): Promise<void> => {
  await db()
    .update(paymentsTable)
    .set(changes)
    .where(eq(paymentsTable.paymentId, paymentId));
};
