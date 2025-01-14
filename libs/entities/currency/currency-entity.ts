import { createSelectSchema } from "drizzle-zod";
import { currenciesTable } from "@schema";
import { z } from "zod";

const baseCurrencySchema = createSelectSchema(currenciesTable);

export const insertCurrencySchema = createSelectSchema(currenciesTable);

export const currencySchema = baseCurrencySchema;

export const clientCurrencySchema = currencySchema.omit({ rateToEuro: true });
export type Currency = z.infer<typeof currencySchema>;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type ClientCurrency = z.infer<typeof clientCurrencySchema>;
