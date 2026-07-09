import type { ShippingRate } from "@shipping-entity";

import { db } from "@db";
import { and, eq, gt, lte } from "drizzle-orm";
import { shippingRatesTable } from "@schema";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";
import * as z from "zod";

const selectShippingRateByIdQuery = (id: string) =>
  db().query.shippingRatesTable.findFirst({
    where: eq(shippingRatesTable.id, id),
    with: {
      ratesToCountries: {
        columns: {
          countryCode: true,
        },
      },
    },
  });

const mapShippingRateFromSelectQueryResult = (
  queryResult: Result<typeof selectShippingRateByIdQuery>,
): ShippingRate | undefined => {
  if (!queryResult) {
    return undefined;
  }
  return {
    ...queryResult,
    countryCodes: queryResult.ratesToCountries.map((rateToCountry) =>
      z
        .string()
        .regex(/^[A-Z]{2}$/)
        .parse(rateToCountry.countryCode),
    ),
  };
};

const selectShippingRatesQuery = (shippingMethodId?: string, weight?: number) =>
  db().query.shippingRatesTable.findMany({
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

const mapShippingRatesFromSelectQueryResult = (
  queryResult: Result<typeof selectShippingRatesQuery>,
): ShippingRate[] => {
  return queryResult.map((shippingRateTemplate) => ({
    ...shippingRateTemplate,
    countryCodes: shippingRateTemplate.ratesToCountries.map((rateToCountry) =>
      z
        .string()
        .regex(/^[A-Z]{2}$/)
        .parse(rateToCountry.countryCode),
    ),
  }));
};

/**
 * Raw weight bands (with ids) for a method — used by the admin rate use-cases to
 * validate that a new/updated band does not overlap the method's other rates.
 * Returns raw rows (id + bounds), unlike the mapped `ShippingRate` shape which
 * intentionally drops the id.
 */
const selectRateBandsByMethodQuery = (shippingMethodId: string) =>
  db().query.shippingRatesTable.findMany({
    where: eq(shippingRatesTable.shippingMethodId, shippingMethodId),
    columns: {
      id: true,
      minWeight: true,
      maxWeight: true,
    },
  });

export const getSelectRateBandsByMethodAction = actionBuilder(
  selectRateBandsByMethodQuery,
);

export const getSelectShippingRateByIdAction = actionBuilder(
  selectShippingRateByIdQuery,
  mapShippingRateFromSelectQueryResult,
);

export const getSelectShippingRatesAction = actionBuilder(
  selectShippingRatesQuery,
  mapShippingRatesFromSelectQueryResult,
);
