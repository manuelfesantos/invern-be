import { createSelectSchema } from "drizzle-zod";
import { countriesTable } from "@schema";
import { z } from "zod";
import { clientCurrencySchema } from "@currency-entity";
import { clientTaxSchema, taxSchema } from "@tax-entity";

const baseCountrySchema = createSelectSchema(countriesTable);

export const insertCountrySchema = createSelectSchema(countriesTable);

export const countrySchema = baseCountrySchema.merge(
  z.object({
    currencies: z.array(clientCurrencySchema).optional(),
    taxes: z.array(taxSchema),
  }),
);

export const clientCountrySchema = baseCountrySchema.merge(
  z.object({
    currencies: z.array(clientCurrencySchema).optional(),
    taxes: z.array(clientTaxSchema),
  }),
);

export const countryEnumSchema = z.enum(countriesTable.code.enumValues);
export const CountryEnum = countryEnumSchema.Enum;
export type CountryEnumType = keyof typeof CountryEnum;

export type Country = z.infer<typeof countrySchema>;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type ClientCountry = z.infer<typeof clientCountrySchema>;
