import { countriesTable, currenciesTable } from "@schema";
import { eq } from "drizzle-orm";
import { Currency } from "@currency-entity";
import { db } from "@db";
import { CountryEnumType } from "@country-entity";

export const getCurrencyByCode = async (
  currencyCode: string,
): Promise<Currency | undefined> => {
  return db().query.currenciesTable.findFirst({
    where: eq(currenciesTable.code, currencyCode),
  });
};

export const getCurrencies = async (): Promise<Currency[]> => {
  return db().query.currenciesTable.findMany();
};

export const getCurrencyByCountryCode = async (
  countryCode: CountryEnumType,
): Promise<Currency | undefined> => {
  return db().query.currenciesTable.findFirst({
    where: eq(countriesTable.code, countryCode),
  });
};
