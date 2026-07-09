import { db } from "@db";
import { eq } from "drizzle-orm";
import { shippingRatesToCountriesTable } from "@schema";
import { actionBuilder } from "@generics-db";

const insertRateCountryQuery = (shippingRateId: string, countryCode: string) =>
  db()
    .insert(shippingRatesToCountriesTable)
    .values({ shippingRateId, countryCode });

const deleteRateCountriesQuery = (shippingRateId: string) =>
  db()
    .delete(shippingRatesToCountriesTable)
    .where(eq(shippingRatesToCountriesTable.shippingRateId, shippingRateId));

export const getInsertRateCountryAction = actionBuilder(insertRateCountryQuery);
export const getDeleteRateCountriesAction = actionBuilder(
  deleteRateCountriesQuery,
);
