import { createSelectSchema } from "drizzle-zod";
import { currenciesTable } from "@schema";
import * as z from "zod";

const baseCurrencySchema = createSelectSchema(currenciesTable, {
  name: z.string().nonempty(),
  code: z.string().regex(/^[A-Z]{3}$/),
  rateToEuro: z.number().nonnegative(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
});

export const insertCurrencySchema = baseCurrencySchema.omit({
  createdAt: true,
  lastModifiedAt: true,
});

export const currencySchema = baseCurrencySchema;

export const clientCurrencySchema = currencySchema.omit({ rateToEuro: true });
export type Currency = z.infer<typeof currencySchema>;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type ClientCurrency = z.infer<typeof clientCurrencySchema>;
