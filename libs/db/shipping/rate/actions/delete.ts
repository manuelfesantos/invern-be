import { db } from "@db";
import { shippingRatesTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const deleteShippingRateQuery = async (id: string) =>
  db()
    .delete(shippingRatesTable)
    .where(eq(shippingRatesTable.id, id))
    .returning()
    .execute();

export const getDeleteShippingRateAction = actionBuilder(
  deleteShippingRateQuery,
);
