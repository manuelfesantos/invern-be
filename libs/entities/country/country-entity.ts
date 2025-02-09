import { createSelectSchema } from "drizzle-zod";
import { countriesTable } from "@schema";
import { z } from "zod";
import { clientCurrencySchema, currencyCodeSchema } from "@currency-entity";
import { clientTaxSchema, taxSchema } from "@tax-entity";
import { requiredStringSchema, countryCodeSchema } from "@global-entity";

const baseCountrySchema = createSelectSchema(countriesTable, {
  name: requiredStringSchema("Country name"),
  code: countryCodeSchema,
  currencyCode: currencyCodeSchema,
  locale: requiredStringSchema("Country locale"),
});

export const insertCountrySchema = baseCountrySchema;

export const countrySchema = baseCountrySchema
  .omit({
    currencyCode: true,
  })
  .extend({
    currency: clientCurrencySchema,
    taxes: z.array(taxSchema),
  });

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

export type Country = z.infer<typeof countrySchema>;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type ClientCountry = z.infer<typeof clientCountrySchema>;
