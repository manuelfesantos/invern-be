import { countriesTable } from "@schema";
import { Country, countrySchema } from "@country-entity";
import { db } from "@db";
import { eq } from "drizzle-orm";

export const getCountryByCode = async (
  countryCode: string,
): Promise<Country | undefined> => {
  const countryTemplate = await db().query.countriesTable.findFirst({
    where: eq(countriesTable.code, countryCode),
    with: {
      countriesToCurrencies: {
        columns: {},
        with: {
          currency: true,
        },
      },
      taxes: true,
    },
  });

  return countrySchema.parse({
    ...countryTemplate,
    currencies: countryTemplate?.countriesToCurrencies
      .map((c) => c.currency)
      .filter((c) => c),
  });
};
