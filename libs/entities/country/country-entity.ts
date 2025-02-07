import { createSelectSchema } from "drizzle-zod";
import { countriesTable } from "@schema";
import { z } from "zod";
import { clientCurrencySchema } from "@currency-entity";
import { clientTaxSchema, taxSchema } from "@tax-entity";

const baseCountrySchema = createSelectSchema(countriesTable);

export const insertCountrySchema = createSelectSchema(countriesTable);

export const countrySchema = baseCountrySchema
  .omit({
    currencyCode: true,
  })
  .merge(
    z.object({
      currency: clientCurrencySchema,
      taxes: z.array(taxSchema),
    }),
  );

export const simpleCountrySchema = baseCountrySchema.omit({
  currencyCode: true,
});

export const clientCountrySchema = baseCountrySchema
  .omit({
    currencyCode: true,
  })
  .merge(
    z.object({
      currency: clientCurrencySchema,
      taxes: z.array(clientTaxSchema),
    }),
  );

export const countryEnumSchema = z.enum(countriesTable.code.enumValues, {
  message: "Invalid Country",
  required_error: "Country Code is Required",
  invalid_type_error: "Country Code needs to be a string",
});
export const CountryEnum = countryEnumSchema.Enum;
export type CountryEnumType = keyof typeof CountryEnum;

export type Country = z.infer<typeof countrySchema>;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type ClientCountry = z.infer<typeof clientCountrySchema>;
