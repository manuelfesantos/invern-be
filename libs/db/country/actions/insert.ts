import { db } from "@db";
import { countriesTable } from "@schema";
import { InsertCountry } from "@country-entity";
import { actionBuilder } from "@generics-db";

const insertCountryQuery = (country: InsertCountry) =>
  db().insert(countriesTable).values(country).returning({
    code: countriesTable.code,
  });

export const getInsertCountryAction = actionBuilder(insertCountryQuery);
