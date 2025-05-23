import { db } from "@db";
import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const deletePaymentQuery = (paymentId: string) =>
  db().delete(paymentsTable).where(eq(paymentsTable.id, paymentId));

export const getDeletePaymentAction = actionBuilder(deletePaymentQuery);
