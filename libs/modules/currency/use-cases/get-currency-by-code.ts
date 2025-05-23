import { getSelectCurrencyByCodeAction } from "@currency-db";
import { Currency } from "@currency-entity";
import { errors } from "@error-handling-utils";

export const getCurrencyByCode = async (code: string): Promise<Currency> => {
  const currency = await getSelectCurrencyByCodeAction(code).run();
  if (!currency) {
    throw errors.CURRENCY_NOT_FOUND();
  }
  return currency;
};
