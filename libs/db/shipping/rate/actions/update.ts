import type { InsertShippingRate } from "@shipping-entity";
import { db } from "@db";
import { shippingRatesTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const updateShippingRateQuery = async (
  id: string,
  updateShippingRate: Partial<InsertShippingRate>,
) =>
  db()
    .update(shippingRatesTable)
    .set(updateShippingRate)
    .where(eq(shippingRatesTable.id, id))
    .returning();

export const getUpdateShippingRateAction = actionBuilder(
  updateShippingRateQuery,
);
