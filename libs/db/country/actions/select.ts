import type { Country } from "@country-entity";
import { countrySchema } from "@country-entity";
import { db } from "@db";
import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { countriesTable } from "@schema";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";
import { DEFAULT_PAGE } from "@number-utils";

const selectCountryByCodeQuery = (countryCode: string) =>
  db().query.countriesTable.findFirst({
    where: eq(countriesTable.code, countryCode),
    columns: {
      currencyCode: false,
    },
    with: {
      currency: {},
      taxes: {
        columns: {
          countryCode: false,
        },
      },
    },
  });

const countriesListConfig = {
  columns: {
    currencyCode: false,
  },
  with: {
    currency: {},
    taxes: {
      columns: {
        countryCode: false,
      },
    },
  },
} as const;

const selectAllCountriesQuery = () =>
  db().query.countriesTable.findMany(countriesListConfig);

const selectCountriesPageQuery = (
  page: number,
  pageSize: number,
  where?: SQL,
  orderBy?: SQL[],
) =>
  db().query.countriesTable.findMany({
    ...countriesListConfig,
    ...(where && { where }),
    ...(orderBy && { orderBy }),
    limit: pageSize,
    offset: (page - DEFAULT_PAGE) * pageSize,
  });

const mapCountryFromQueryResult = (
  queryResult: Result<typeof selectCountryByCodeQuery>,
): Country | undefined => {
  if (!queryResult) return;
  return countrySchema.parse({
    ...queryResult,
    taxes: queryResult?.taxes ?? [],
  });
};

const mapCountriesFromQueryResult = (
  queryResult: Result<typeof selectAllCountriesQuery>,
): Country[] => {
  return queryResult
    .map(mapCountryFromQueryResult)
    .filter(Boolean) as Country[];
};

export const getSelectCountryByCodeAction = actionBuilder(
  selectCountryByCodeQuery,
  mapCountryFromQueryResult,
);

export const getSelectAllCountriesAction = actionBuilder(
  selectAllCountriesQuery,
  mapCountriesFromQueryResult,
);

export const getSelectCountriesPageAction = actionBuilder(
  selectCountriesPageQuery,
  mapCountriesFromQueryResult,
);
