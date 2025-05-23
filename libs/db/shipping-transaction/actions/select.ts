import { shippingMethodsTable } from "@schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const selectShippingTransactionQuery = (id: string) =>
  db().query.shippingTransactionsTable.findFirst({
    where: eq(shippingMethodsTable.id, id),
  });

export const getSelectShippingTransactionAction = actionBuilder(
  selectShippingTransactionQuery,
);
