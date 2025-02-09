import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { taxesTable } from "@schema";
import { z } from "zod";
import {
  positiveIntegerSchema,
  positiveNumberSchema,
  requiredStringSchema,
} from "@global-entity";
import { countryCodeSchema } from "@global-entity";

const baseTaxSchema = createSelectSchema(taxesTable, {
  id: requiredStringSchema("tax id"),
  countryCode: countryCodeSchema,
  name: requiredStringSchema("tax name"),
  rate: positiveNumberSchema("tax rate"),
});
export const insertTaxSchema = createInsertSchema(taxesTable).omit({
  id: true,
});

export const taxSchema = baseTaxSchema.omit({ countryCode: true });

export const clientTaxSchema = taxSchema.omit({
  id: true,
});

export const extendedClientTaxSchema = clientTaxSchema.extend({
  amount: positiveIntegerSchema("tax amount"),
});

export type Tax = z.infer<typeof taxSchema>;

export type ExtendedClientTax = z.infer<typeof extendedClientTaxSchema>;

export type InsertTax = z.infer<typeof insertTaxSchema>;
