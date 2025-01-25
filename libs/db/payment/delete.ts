import { db } from "@db";
import { contextStore } from "@context-utils";
import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";

export const deletePayment = async (paymentId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(paymentsTable)
    .where(eq(paymentsTable.id, paymentId));
};
