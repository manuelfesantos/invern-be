import { db } from "@db";
import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";

export const deletePayment = async (paymentId: string): Promise<void> => {
  await db().delete(paymentsTable).where(eq(paymentsTable.id, paymentId));
};
