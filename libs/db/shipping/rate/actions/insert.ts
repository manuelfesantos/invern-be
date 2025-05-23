import { BaseShippingRate } from "@shipping-entity";
import { db } from "@db";
import { shippingRatesTable, shippingRatesToCountriesTable } from "@schema";
import { actionBuilder } from "@generics-db";

const insertShippingRateQuery = (
  insertShippingRate: Omit<BaseShippingRate, "createdAt" | "lastModifiedAt">,
) => db().insert(shippingRatesTable).values(insertShippingRate).returning();

const insertShippingRateInCountryQuery = (
  countryCode: string,
  shippingRate: Omit<BaseShippingRate, "createdAt" | "lastModifiedAt">,
) =>
  db().insert(shippingRatesToCountriesTable).values({
    shippingRateId: shippingRate.id,
    countryCode,
  });

export const getInsertShippingRateAction = actionBuilder(
  insertShippingRateQuery,
);

export const getInsertShippingRateInCountryAction = actionBuilder(
  insertShippingRateInCountryQuery,
);
