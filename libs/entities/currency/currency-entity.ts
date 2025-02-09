import { createSelectSchema } from "drizzle-zod";
import { currenciesTable } from "@schema";
import { z } from "zod";
import { positiveNumberSchema, requiredStringSchema } from "@global-entity";

const CURRENCY_CODE_LENGTH = 3;

export const currencyCodeSchema = requiredStringSchema("Currency code")
  .refine((value) => value.length === CURRENCY_CODE_LENGTH, {
    message: "Currency code should be a 3 letter string",
  })
  .refine((value) => /^[A-Z]+$/.test(value), {
    message: "Currency code should be uppercase",
  });

const baseCurrencySchema = createSelectSchema(currenciesTable, {
  name: requiredStringSchema("Currency name"),
  code: currencyCodeSchema,
  rateToEuro: positiveNumberSchema("Currency rate to euro"),
});

export const insertCurrencySchema = baseCurrencySchema;

export const currencySchema = baseCurrencySchema;

export const clientCurrencySchema = currencySchema.omit({ rateToEuro: true });
export type Currency = z.infer<typeof currencySchema>;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type ClientCurrency = z.infer<typeof clientCurrencySchema>;
