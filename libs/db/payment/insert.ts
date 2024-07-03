import { InsertPayment } from "@payment-entity";
import { db } from "@db";
import { paymentsTable } from "@schema";

export const insertPayment = async (
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
    paymentId: paymentsTable.paymentId,
  });
};
