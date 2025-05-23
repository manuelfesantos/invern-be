import { paymentsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const selectPaymentByIdQuery = (paymentId: string) =>
  db().query.paymentsTable.findFirst({
    where: eq(paymentsTable.id, paymentId),
  });

export const getSelectPaymentByIdAction = actionBuilder(selectPaymentByIdQuery);
