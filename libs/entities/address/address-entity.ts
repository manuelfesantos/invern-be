import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addressesTable } from "@schema";
import { z } from "zod";

const baseAddressSchema = createSelectSchema(addressesTable);

export const insertAddressSchema = createInsertSchema(addressesTable).omit({
  addressId: true,
});

export const addressSchema = baseAddressSchema;

export type Address = z.infer<typeof addressSchema>;

export type InsertAddress = z.infer<typeof insertAddressSchema>;
