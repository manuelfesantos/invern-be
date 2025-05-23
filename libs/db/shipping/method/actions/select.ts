import { ShippingMethod } from "@shipping-entity";

import { db } from "@db";
import { and, eq, gt, lte } from "drizzle-orm";
import { shippingMethodsTable, shippingRatesTable } from "@schema";
import { countryCodeSchema } from "@global-entity";
import { actionBuilder, Result } from "@generics-db";

const selectShippingMethodQuery = (id: string, weight?: number) =>
  db().query.shippingMethodsTable.findFirst({
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
  });

const mapShippingMethodFromSelectResult = (
  queryResult: Result<typeof selectShippingMethodQuery>,
): ShippingMethod | undefined => {
  if (!queryResult) {
    return;
  }

  return {
    ...queryResult,
    rates: queryResult.rates.map((rate) => ({
      ...rate,
      countryCodes: rate.ratesToCountries.map((rateToCountry) =>
        countryCodeSchema.parse(rateToCountry.countryCode),
      ),
    })),
  };
};

const selectShippingMethodsQuery = (weight?: number) =>
  db().query.shippingMethodsTable.findMany({
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
  });

const mapShippingMethodsFromSelectResult = (
  queryResult: Result<typeof selectShippingMethodsQuery>,
): ShippingMethod[] => {
  return queryResult.map((result) => ({
    ...result,
    rates: result.rates.map((rate) => ({
      ...rate,
      countryCodes: rate.ratesToCountries.map((rateToCountry) =>
        countryCodeSchema.parse(rateToCountry.countryCode),
      ),
    })),
  }));
};

export const getSelectShippingMethodAction = actionBuilder(
  selectShippingMethodQuery,
  mapShippingMethodFromSelectResult,
);

export const getSelectShippingMethodsAction = actionBuilder(
  selectShippingMethodsQuery,
  mapShippingMethodsFromSelectResult,
);
