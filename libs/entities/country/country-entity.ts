import { createSelectSchema } from "drizzle-zod";
import { countriesTable } from "@schema";
import { z } from "zod";
import { clientCurrencySchema } from "@currency-entity";
import { clientTaxSchema } from "@tax-entity";

const baseCountrySchema = createSelectSchema(countriesTable);

export const insertCountrySchema = createSelectSchema(countriesTable);

export const countrySchema = baseCountrySchema.merge(
  z.object({
    currencies: z.array(clientCurrencySchema).optional(),
    taxes: z.array(clientTaxSchema),
  }),
);

export type Country = z.infer<typeof countrySchema>;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
