import type { Currency, InsertCurrency } from "@currency-entity";
import { runBatchOperation } from "@generics-db";
import {
  getSelectCurrencyByCodeAction,
  getUpdateCurrencyAction,
} from "@currency-db";

export const updateCurrencyOperation = async (
  currencyCode: string,
  currencyUpdate: Partial<InsertCurrency>,
): Promise<Currency | undefined> => {
  const [, updatedCurrency] = await runBatchOperation(
    getUpdateCurrencyAction(currencyCode, currencyUpdate),
    getSelectCurrencyByCodeAction(currencyCode),
  );

  return updatedCurrency;
};
