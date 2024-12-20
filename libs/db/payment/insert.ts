import { InsertPayment, Payment } from "@payment-entity";
import { db } from "@db";
import { paymentsTable } from "@schema";

export const insertPaymentReturningId = async (
  payment: InsertPayment,
): Promise<
  {
    paymentId: string;
  }[]
> => {
  const insertPayment = {
    ...payment,
    createdAt: new Date().toISOString(),
  };
  return db().insert(paymentsTable).values(insertPayment).returning({
    paymentId: paymentsTable.id,
  });
};

export const insertPaymentReturningAll = async (
  payment: InsertPayment,
): Promise<Payment[]> => {
  const insertPayment = {
    ...payment,
    createdAt: new Date().toISOString(),
  };
  return db().insert(paymentsTable).values(insertPayment).returning();
};
