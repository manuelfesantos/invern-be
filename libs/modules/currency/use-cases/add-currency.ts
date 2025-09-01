import type { Currency} from "@currency-entity";
import { insertCurrencySchema } from "@currency-entity";
import {
  getInsertCurrencyAction,
  getSelectCurrencyByCodeAction,
} from "@currency-db";

export const addCurrency = async (body: unknown): Promise<Currency> => {
  const currencyInsert = insertCurrencySchema.parse(body);
  const [{ code }] = await getInsertCurrencyAction(currencyInsert).run();
  if (!code) {
    throw new Error(`Failed to add currency with code: ${code}`);
  }
  const currency = await getSelectCurrencyByCodeAction(code).run();
  if (!currency) {
    throw new Error(`Failed to add currency with code: ${code}`);
  }
  return currency;
};
