import type { InsertCountry } from "@country-entity";
import { countriesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const updateCountryQuery = (
  countryCode: string,
  changes: Partial<InsertCountry>,
) =>
  db()
    .update(countriesTable)
    .set(changes)
    .where(eq(countriesTable.code, countryCode));

export const getUpdateCountryAction = actionBuilder(updateCountryQuery);
