import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { taxesTable } from "@schema";
import { z } from "zod";
import { positiveIntegerSchema } from "@global-entity";

const baseTaxSchema = createSelectSchema(taxesTable);
export const insertTaxSchema = createInsertSchema(taxesTable).omit({
  id: true,
});

export const taxSchema = baseTaxSchema.omit({ countryCode: true });

export const clientTaxSchema = taxSchema.omit({
  id: true,
});

export const extendedClientTaxSchema = clientTaxSchema.merge(
  z.object({
    amount: positiveIntegerSchema("tax amount"),
  }),
);

export type Tax = z.infer<typeof taxSchema>;

export type ExtendedClientTax = z.infer<typeof extendedClientTaxSchema>;

export type InsertTax = z.infer<typeof insertTaxSchema>;
