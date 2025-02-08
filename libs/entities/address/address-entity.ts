import { z } from "zod";
import { countryEnumSchema } from "@country-entity";
import { requiredStringSchema } from "@global-entity";

export const addressSchema = z.object({
  street: requiredStringSchema("street"),
  houseNumber: requiredStringSchema("houseNumber"),
  apartment: z.string().optional(),
  postalCode: requiredStringSchema("postalCode"),
  city: requiredStringSchema("city"),
  province: z.string().optional(),
  country: countryEnumSchema,
});

export const insertAddressSchema = addressSchema.omit({
  country: true,
});

export type Address = z.infer<typeof addressSchema>;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
