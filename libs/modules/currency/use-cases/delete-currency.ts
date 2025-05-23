import { getDeleteCurrencyAction as deleteCurrencyFromDb } from "@currency-db";

export const deleteCurrency = async (currencyCode: string): Promise<void> => {
  deleteCurrencyFromDb(currencyCode).run();
};
