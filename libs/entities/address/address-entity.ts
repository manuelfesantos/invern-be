import * as z from "zod";

export const addressSchema = z.object({
  street: z.string().nonempty(),
  houseNumber: z.string().nonempty(),
  apartment: z.string().nonempty().optional(),
  postalCode: z.string().nonempty(),
  city: z.string().nonempty(),
  province: z.string().nonempty().optional(),
  country: z.string().regex(/^[A-Z]{2}$/),
});
export const insertAddressSchema = addressSchema.omit({
  country: true,
});

export type Address = z.infer<typeof addressSchema>;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
