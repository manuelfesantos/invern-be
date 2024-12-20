import { countriesTable } from "@schema";
import {
  ClientCountry,
  clientCountrySchema,
  Country,
  CountryEnumType,
  countrySchema,
} from "@country-entity";
import { db } from "@db";
import { eq } from "drizzle-orm";

export const getCountryByCode = async (
  countryCode: CountryEnumType,
): Promise<Country | undefined> => {
  const countryTemplate = await db().query.countriesTable.findFirst({
    where: eq(countriesTable.code, countryCode),
    with: {
      countriesToCurrencies: {
        columns: {},
        with: {
          currency: {
            columns: {
              rateToEuro: false,
            },
          },
        },
      },
      taxes: {
        columns: {
          countryCode: false,
        },
      },
    },
  });

  if (!countryTemplate) {
    return;
  }

  return countrySchema.parse({
    ...countryTemplate,
    currencies: countryTemplate.countriesToCurrencies
      .map((c) => c.currency)
      .filter((c) => c),
    taxes: countryTemplate.taxes || [],
  });
};

export const selectAllCountries = async (): Promise<ClientCountry[]> => {
  const countriesTemplate = await db().query.countriesTable.findMany({
    with: {
      countriesToCurrencies: {
        columns: {},
        with: {
          currency: {
            columns: {
              rateToEuro: false,
            },
          },
        },
      },
      taxes: {
        columns: {
          countryCode: false,
        },
      },
    },
  });
  return countriesTemplate.map((countryTemplate) =>
    clientCountrySchema.parse({
      ...countryTemplate,
      currencies: countryTemplate.countriesToCurrencies
        .map((c) => c.currency)
        .filter((c) => c),
      taxes: countryTemplate.taxes || [],
    }),
  );
};
