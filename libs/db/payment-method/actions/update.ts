import { paymentMethodsTable } from "@schema";
import { eq } from "drizzle-orm";
import { PaymentMethod } from "@payment-entity";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const updatePaymentMethodQuery = (
  paymentMethodId: string,
  updatePaymentMethod: Partial<PaymentMethod>,
) =>
  db()
    .update(paymentMethodsTable)
    .set(updatePaymentMethod)
    .where(eq(paymentMethodsTable.id, paymentMethodId))
    .returning();

export const getUpdatePaymentMethodAction = actionBuilder(
  updatePaymentMethodQuery,
);
