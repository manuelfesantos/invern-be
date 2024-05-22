import { InsertPayment } from "@payment-entity";
import { db } from "../db-client";
import { paymentsTable } from "@schema";
import { getRandomUUID } from "@crypto-utils";

export const insertPayment = async (
  payment: InsertPayment,
): Promise<
  {
    paymentId: string;
  }[]
> => {
  const insertPayment = {
    ...payment,
    paymentId: getRandomUUID(),
    createdAt: new Date().toISOString(),
  };
  return db().insert(paymentsTable).values(insertPayment).returning({
    paymentId: paymentsTable.paymentId,
  });
};
