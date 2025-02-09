import { BaseShippingRate, InsertShippingRate } from "@shipping-entity";
import { shippingRatesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const updateShippingRate = async (
  id: string,
  updateShippingRate: Partial<InsertShippingRate>,
): Promise<BaseShippingRate | undefined> => {
  const [shippingRate] = await db()
    .update(shippingRatesTable)
    .set(updateShippingRate)
    .where(eq(shippingRatesTable.id, id))
    .returning()
    .execute();

  return shippingRate;
};
