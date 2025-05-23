import { InsertPayment } from "@payment-entity";
import { db } from "@db";
import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const updatePaymentQuery = (
  paymentId: string,
  changes: Partial<InsertPayment>,
) =>
  db()
    .update(paymentsTable)
    .set(changes)
    .where(eq(paymentsTable.id, paymentId))
    .returning();

export const getUpdatePaymentAction = actionBuilder(updatePaymentQuery);
