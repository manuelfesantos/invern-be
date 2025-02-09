import { shippingRatesTable } from "@schema";
import { and, eq, gt, lte } from "drizzle-orm";
import { db } from "@db";
import { ShippingRate } from "@shipping-entity";
import { countryCodeSchema } from "@global-entity";

export const selectShippingRateById = async (
  id: string,
): Promise<ShippingRate | undefined> => {
  const shippingRateTemplate = await db().query.shippingRatesTable.findFirst({
    where: eq(shippingRatesTable.id, id),
    with: {
      ratesToCountries: {
        columns: {
          countryCode: true,
        },
      },
    },
  });

  if (!shippingRateTemplate) {
    return;
  }

  return {
    ...shippingRateTemplate,
    countryCodes: shippingRateTemplate.ratesToCountries.map((rateToCountry) =>
      countryCodeSchema.parse(rateToCountry.countryCode),
    ),
  };
};

export const selectShippingRates = async (
  shippingMethodId?: string,
  weight?: number,
): Promise<ShippingRate[]> => {
  const shippingRateTemplates = await db().query.shippingRatesTable.findMany({
    where: and(
      shippingMethodId
        ? eq(shippingRatesTable.shippingMethodId, shippingMethodId)
        : undefined,
      weight
        ? and(
            gt(shippingRatesTable.maxWeight, weight),
            lte(shippingRatesTable.minWeight, weight),
          )
        : undefined,
    ),
    with: {
      ratesToCountries: {
        columns: {
          countryCode: true,
        },
      },
    },
  });

  return shippingRateTemplates.map((shippingRateTemplate) => ({
    ...shippingRateTemplate,
    countryCodes: shippingRateTemplate.ratesToCountries.map((rateToCountry) =>
      countryCodeSchema.parse(rateToCountry.countryCode),
    ),
  }));
};
