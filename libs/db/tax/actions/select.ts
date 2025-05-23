import { taxesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const selectTaxByIdQuery = (id: string) =>
  db().query.taxesTable.findFirst({
    where: eq(taxesTable.id, id),
    columns: {
      countryCode: false,
    },
  });

const selectTaxesByCountryCodeQuery = (countryCode: string) =>
  db().query.taxesTable.findMany({
    where: eq(taxesTable.countryCode, countryCode),
  });

export const getSelectTaxByIdAction = actionBuilder(selectTaxByIdQuery);

export const getSelectTaxesByCountryCodeAction = actionBuilder(
  selectTaxesByCountryCodeQuery,
);
