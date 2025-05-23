import { db } from "@db";
import { InsertPaymentMethod } from "@payment-entity";
import { paymentMethodsTable } from "@schema";
import { actionBuilder } from "@generics-db";

const insertPaymentMethodQuery = (insertPaymentMethod: InsertPaymentMethod) =>
  db().insert(paymentMethodsTable).values(insertPaymentMethod).returning();

export const getInsertPaymentMethodAction = actionBuilder(
  insertPaymentMethodQuery,
);
