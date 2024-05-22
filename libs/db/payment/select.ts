import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";
import { Payment } from "@payment-entity";
import { db } from "@db";

export const getPaymentById = async (
  paymentId: string,
): Promise<Payment | undefined> => {
  return db().query.paymentsTable.findFirst({
    where: eq(paymentsTable.paymentId, paymentId),
  });
};
