import type { Currency } from "@currency-entity";
import { getSelectAllCurrenciesAction } from "@currency-db";

export const getAllCurrencies = async (): Promise<Currency[]> => {
  return await getSelectAllCurrenciesAction().run();
};
