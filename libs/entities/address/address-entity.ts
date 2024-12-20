import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addressesTable } from "@schema";
import { z } from "zod";
import { clientCountrySchema, countrySchema } from "@country-entity";

const baseAddressSchema = createSelectSchema(addressesTable);

export const insertAddressSchema = createInsertSchema(addressesTable).omit({
  id: true,
});

export const addressSchema = baseAddressSchema
  .omit({ country: true })
  .merge(z.object({ country: countrySchema }));

export const clientAddressSchema = addressSchema.omit({ country: true }).merge(
  z.object({
    country: clientCountrySchema,
  }),
);

export type BaseAddress = z.infer<typeof baseAddressSchema>;

export type Address = z.infer<typeof addressSchema>;

export type InsertAddress = z.infer<typeof insertAddressSchema>;
