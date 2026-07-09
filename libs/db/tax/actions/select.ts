import { taxesTable } from "@schema";
import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@db";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";
import { DEFAULT_PAGE } from "@number-utils";
import type { AdminTax } from "@tax-entity";
import { adminTaxSchema } from "@tax-entity";

const selectTaxByIdQuery = (id: string) =>
  db().query.taxesTable.findFirst({
    where: eq(taxesTable.id, id),
  });

const selectTaxesByCountryCodeQuery = (countryCode: string) =>
  db().query.taxesTable.findMany({
    where: eq(taxesTable.countryCode, countryCode),
  });

const selectTaxesPageQuery = (
  page: number,
  pageSize: number,
  where?: SQL,
  orderBy?: SQL[],
) =>
  db().query.taxesTable.findMany({
    ...(where && { where }),
    ...(orderBy && { orderBy }),
    limit: pageSize,
    offset: (page - DEFAULT_PAGE) * pageSize,
  });

const mapTax = (
  result: Result<typeof selectTaxByIdQuery>,
): AdminTax | undefined => (result ? adminTaxSchema.parse(result) : undefined);

const mapTaxes = (result: Result<typeof selectTaxesPageQuery>): AdminTax[] =>
  result.map((tax) => adminTaxSchema.parse(tax));

export const getSelectTaxByIdAction = actionBuilder(selectTaxByIdQuery, mapTax);

export const getSelectTaxesByCountryCodeAction = actionBuilder(
  selectTaxesByCountryCodeQuery,
);

export const getSelectTaxesPageAction = actionBuilder(
  selectTaxesPageQuery,
  mapTaxes,
);
