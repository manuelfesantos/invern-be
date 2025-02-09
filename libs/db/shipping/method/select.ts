import { ShippingMethod } from "@shipping-entity";
import { db } from "@db";
import { and, eq, gt, lte } from "drizzle-orm";
import { shippingMethodsTable, shippingRatesTable } from "@schema";
import { countryCodeSchema } from "@global-entity";

export const selectShippingMethod = async (
  id: string,
  weight?: number,
): Promise<ShippingMethod | undefined> => {
  const shippingMethodTemplate = await db()
    .query.shippingMethodsTable.findFirst({
      where: eq(shippingMethodsTable.id, id),
      with: {
        rates: {
          ...(weight && {
            where: and(
              gt(shippingRatesTable.maxWeight, weight),
              lte(shippingRatesTable.minWeight, weight),
            ),
          }),
          with: {
            ratesToCountries: {
              columns: {
                countryCode: true,
              },
            },
          },
        },
      },
    })
    .execute();

  if (!shippingMethodTemplate) {
    return;
  }

  return {
    ...shippingMethodTemplate,
    rates: shippingMethodTemplate.rates.map((rate) => ({
      ...rate,
      countryCodes: rate.ratesToCountries.map((rateToCountry) =>
        countryCodeSchema.parse(rateToCountry.countryCode),
      ),
    })),
  };
};

export const selectShippingMethods = async (
  weight?: number,
): Promise<ShippingMethod[]> => {
  const shippingMethodTemplates = await db()
    .query.shippingMethodsTable.findMany({
      with: {
        rates: {
          ...(weight && {
            where: and(
              gt(shippingRatesTable.maxWeight, weight),
              lte(shippingRatesTable.minWeight, weight),
            ),
          }),
          with: {
            ratesToCountries: {
              columns: {
                countryCode: true,
              },
            },
          },
        },
      },
    })
    .execute();

  return shippingMethodTemplates.map((shippingMethodTemplate) => ({
    ...shippingMethodTemplate,
    rates: shippingMethodTemplate.rates.map((rate) => ({
      ...rate,
      countryCodes: rate.ratesToCountries.map((rateToCountry) =>
        countryCodeSchema.parse(rateToCountry.countryCode),
      ),
    })),
  }));
};
