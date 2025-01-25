import { InsertCurrency } from "@currency-entity";
import { currenciesTable } from "@schema";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const insertCurrency = async (
  currency: InsertCurrency,
): Promise<
  {
    code: string;
  }[]
> => {
  return (contextStore.context.transaction ?? db())
    .insert(currenciesTable)
    .values(currency)
    .returning({
      code: currenciesTable.code,
    });
};
