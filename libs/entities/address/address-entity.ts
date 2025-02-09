import { optional, z } from "zod";
import { countryCodeSchema } from "@global-entity";
import { requiredStringSchema } from "@global-entity";

export const addressSchema = z.object({
  street: requiredStringSchema("street"),
  houseNumber: requiredStringSchema("houseNumber"),
  apartment: z.optional(requiredStringSchema("apartment")),
  postalCode: requiredStringSchema("postalCode"),
  city: requiredStringSchema("city"),
  province: optional(requiredStringSchema("province")),
  country: countryCodeSchema,
});

export const insertAddressSchema = addressSchema.omit({
  country: true,
});

export type Address = z.infer<typeof addressSchema>;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
