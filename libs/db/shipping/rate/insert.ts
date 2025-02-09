import { BaseShippingRate, InsertShippingRate } from "@shipping-entity";
import { db } from "@db";
import { getRandomUUID } from "@crypto-utils";
import { shippingRatesTable, shippingRatesToCountriesTable } from "@schema";

export const insertShippingRate = async (
  insertShippingRate: InsertShippingRate,
  countryCodes: string[],
): Promise<BaseShippingRate> => {
  const shippingRate = {
    ...insertShippingRate,
    id: getRandomUUID(),
  };

  const [newShippingRate] = await db()
    .insert(shippingRatesTable)
    .values(shippingRate)
    .returning()
    .execute();

  for (const countryCode of countryCodes) {
    await db()
      .insert(shippingRatesToCountriesTable)
      .values({
        shippingRateId: newShippingRate.id,
        countryCode,
      })
      .execute();
  }

  return newShippingRate;
};
