import { db } from "@db";
import { eq } from "drizzle-orm";
import { paymentMethodsTable } from "@schema";
import { actionBuilder } from "@generics-db";

const selectPaymentMethodByIdQuery = (paymentMethodId: string) =>
  db().query.paymentMethodsTable.findFirst({
    where: eq(paymentMethodsTable.id, paymentMethodId),
  });

export const getSelectPaymentMethodByIdAction = actionBuilder(
  selectPaymentMethodByIdQuery,
);
