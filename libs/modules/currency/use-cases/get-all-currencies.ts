import { Currency } from "@currency-entity";
import { getSelectAllCurrenciesAction } from "@currency-db";

export const getAllCurrencies = (): Promise<Currency[]> => {
  return getSelectAllCurrenciesAction().run();
};
