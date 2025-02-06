import { InsertCurrency } from "@currency-entity";
import { currenciesTable } from "@schema";
import { db } from "@db";

export const insertCurrency = async (
  currency: InsertCurrency,
): Promise<
  {
    code: string;
  }[]
> => {
  return db().insert(currenciesTable).values(currency).returning({
    code: currenciesTable.code,
  });
};
