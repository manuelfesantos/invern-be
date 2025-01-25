import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";
import { Payment } from "@payment-entity";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const getPaymentById = async (
  paymentId: string,
): Promise<Payment | undefined> => {
  return (
    contextStore.context.transaction ?? db()
  ).query.paymentsTable.findFirst({
    where: eq(paymentsTable.id, paymentId),
  });
};
