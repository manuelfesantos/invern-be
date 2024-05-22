import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { taxesTable } from "@schema";
import { z } from "zod";

const baseTaxSchema = createSelectSchema(taxesTable);
export const insertTaxSchema = createInsertSchema(taxesTable).omit({
  taxId: true,
});

export const taxSchema = baseTaxSchema.omit({ countryCode: true });

export type Tax = z.infer<typeof taxSchema>;

export type InsertTax = z.infer<typeof insertTaxSchema>;
