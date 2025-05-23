import { db } from "@db";
import { countriesTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const deleteCountryQuery = (countryCode: string) =>
  db().delete(countriesTable).where(eq(countriesTable.code, countryCode));

export const getDeleteCountryAction = actionBuilder(deleteCountryQuery);
