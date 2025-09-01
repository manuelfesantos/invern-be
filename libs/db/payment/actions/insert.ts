import type { InsertPayment } from "@payment-entity";
import { db } from "@db";
import { paymentsTable } from "@schema";
import { actionBuilder } from "@generics-db";

const insertPaymentReturningIdQuery = (payment: InsertPayment) => {
  const insertPayment = {
    ...payment,
    createdAt: new Date().toISOString(),
  };
  return db().insert(paymentsTable).values(insertPayment).returning({
    paymentId: paymentsTable.id,
  });
};

const insertPaymentReturningAllQuery = (payment: InsertPayment) => {
  const insertPayment = {
    ...payment,
    createdAt: new Date().toISOString(),
  };
  return db().insert(paymentsTable).values(insertPayment).returning();
};

export const getInsertPaymentReturningIdAction = actionBuilder(
  insertPaymentReturningIdQuery,
);

export const getInsertPaymentReturningAllAction = actionBuilder(
  insertPaymentReturningAllQuery,
);
