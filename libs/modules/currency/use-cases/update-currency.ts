import { Currency, insertCurrencySchema } from "@currency-entity";
import { updateCurrencyOperation } from "./operations/update-currency";

export const updateCurrency = async (
  currencyCode: string,
  body: unknown,
): Promise<Currency> => {
  const currencyUpdate = insertCurrencySchema.parse(body);
  const updatedCurrency = await updateCurrencyOperation(
    currencyCode,
    currencyUpdate,
  );
  if (!updatedCurrency) {
    throw new Error(`Failed to update currency with code: ${currencyCode}`);
  }

  return updatedCurrency;
};
