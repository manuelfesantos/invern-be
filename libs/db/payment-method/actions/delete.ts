import { paymentMethodsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const deletePaymentMethodQuery = (paymentMethodId: string) =>
  db()
    .delete(paymentMethodsTable)
    .where(eq(paymentMethodsTable.id, paymentMethodId));

export const deletePaymentMethod = actionBuilder(deletePaymentMethodQuery);
