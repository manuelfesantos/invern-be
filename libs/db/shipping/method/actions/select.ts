import type { ShippingMethod } from "@shipping-entity";

import { db } from "@db";
import type { SQL } from "drizzle-orm";
import { and, eq, gt, lte } from "drizzle-orm";
import { shippingMethodsTable, shippingRatesTable } from "@schema";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";
import { DEFAULT_PAGE } from "@number-utils";
import * as z from "zod";

const ratesWith = {
  rates: {
    with: {
      ratesToCountries: {
        columns: {
          countryCode: true,
        },
      },
    },
  },
} as const;

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
        z
          .string()
          .regex(/^[A-Z]{2}$/)
          .parse(rateToCountry.countryCode),
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
        z
          .string()
          .regex(/^[A-Z]{2}$/)
          .parse(rateToCountry.countryCode),
      ),
    })),
  }));
};

const selectShippingMethodsPageQuery = (
  page: number,
  pageSize: number,
  where?: SQL,
  orderBy?: SQL[],
) =>
  db().query.shippingMethodsTable.findMany({
    with: ratesWith,
    ...(where && { where }),
    ...(orderBy && { orderBy }),
    limit: pageSize,
    offset: (page - DEFAULT_PAGE) * pageSize,
  });

export const getSelectShippingMethodAction = actionBuilder(
  selectShippingMethodQuery,
  mapShippingMethodFromSelectResult,
);

export const getSelectShippingMethodsAction = actionBuilder(
  selectShippingMethodsQuery,
  mapShippingMethodsFromSelectResult,
);

export const getSelectShippingMethodsPageAction = actionBuilder(
  selectShippingMethodsPageQuery,
  mapShippingMethodsFromSelectResult,
);
