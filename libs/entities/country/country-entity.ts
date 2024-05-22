import { createSelectSchema } from "drizzle-zod";
import { countriesTable } from "@schema";
import { z } from "zod";
import { currencySchema } from "@currency-entity";
import { taxSchema } from "@tax-entity";

const baseCountrySchema = createSelectSchema(countriesTable);

export const insertCountrySchema = createSelectSchema(countriesTable);

export const countrySchema = baseCountrySchema.merge(
  z.object({
    currencies: z.array(currencySchema).optional(),
    taxes: z.array(taxSchema),
  }),
);

export type Country = z.infer<typeof countrySchema>;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
