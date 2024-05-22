import { db } from "@db";
import { currenciesTable } from "@schema";
import { InsertCurrency } from "@currency-entity";

const currenciesList: InsertCurrency[] = [
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    rateToEuro: 1,
  },
  {
    code: "USD",
    name: "Dollar",
    symbol: "$",
    rateToEuro: 0.92,
  },
  {
    code: "GBP",
    name: "Pound",
    symbol: "£",
    rateToEuro: 1.17,
  },
];

export const insertCurrencies = async (): Promise<{ code: string }[]> => {
  return db()
    .insert(currenciesTable)
    .values(currenciesList)
    .returning({ code: currenciesTable.code });
};
