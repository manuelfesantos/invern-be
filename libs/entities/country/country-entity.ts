import { createSelectSchema } from "drizzle-zod";
import { countriesTable } from "@schema";
import * as z from "zod";
import { clientCurrencySchema } from "@currency-entity";
import { clientTaxSchema, taxSchema } from "@tax-entity";

const baseCountrySchema = createSelectSchema(countriesTable, {
  name: z.string().nonempty(),
  code: z.string().regex(/^[A-Z]{2}$/),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
  locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
});

export const insertCountrySchema = baseCountrySchema.omit({
  createdAt: true,
  lastModifiedAt: true,
});

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
  .extend({
    currency: clientCurrencySchema,
    taxes: z.array(clientTaxSchema),
  });

export type Country = z.infer<typeof countrySchema>;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type ClientCountry = z.infer<typeof clientCountrySchema>;
