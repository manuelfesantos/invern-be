import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addressesTable } from "@schema";
import { z } from "zod";
import {
  clientCountrySchema,
  countryEnumSchema,
  countrySchema,
  simpleCountrySchema,
} from "@country-entity";

const baseAddressSchema = createSelectSchema(addressesTable);

export const insertAddressSchema = createInsertSchema(addressesTable)
  .omit({
    id: true,
  })
  .extend({
    country: countryEnumSchema,
  });

export const addressSchema = baseAddressSchema.extend({
  country: countrySchema,
  line2: z.string().optional().nullable(),
});

export const clientAddressSchema = addressSchema.omit({ country: true }).merge(
  z.object({
    country: clientCountrySchema,
  }),
);

export const simpleAddressSchema = addressSchema
  .omit({
    id: true,
  })
  .extend({
    country: simpleCountrySchema,
  });

export type BaseAddress = z.infer<typeof baseAddressSchema>;

export type Address = z.infer<typeof addressSchema>;

export type InsertAddress = z.infer<typeof insertAddressSchema>;
