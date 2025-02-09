import { BaseShippingRate } from "@shipping-entity";
import { db } from "@db";
import { shippingRatesTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteShippingRate = async (
  id: string,
): Promise<BaseShippingRate | undefined> => {
  const [shippingRate] = await db()
    .delete(shippingRatesTable)
    .where(eq(shippingRatesTable.id, id))
    .returning()
    .execute();
  return shippingRate;
};
