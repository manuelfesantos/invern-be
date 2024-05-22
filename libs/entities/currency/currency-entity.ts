import { createSelectSchema } from "drizzle-zod";
import { currenciesTable } from "@schema";
import { z } from "zod";

const baseCurrencySchema = createSelectSchema(currenciesTable);

export const insertCurrencySchema = createSelectSchema(currenciesTable);

export const currencySchema = baseCurrencySchema;

export type Currency = z.infer<typeof currencySchema>;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
