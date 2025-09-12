import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { taxesTable } from "@schema";
import * as z from "zod";

const baseTaxSchema = createSelectSchema(taxesTable, {
  id: z.string().nonempty(),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  name: z.string().nonempty(),
  rate: z.number().nonnegative(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
});
export const insertTaxSchema = createInsertSchema(taxesTable).omit({
  id: true,
});

export const taxSchema = baseTaxSchema.omit({ countryCode: true });

export const clientTaxSchema = taxSchema.omit({
  id: true,
  createdAt: true,
  lastModifiedAt: true,
});

export const extendedClientTaxSchema = clientTaxSchema.extend({
  amount: z.number().nonnegative(),
});

export type Tax = z.infer<typeof taxSchema>;

export type ExtendedClientTax = z.infer<typeof extendedClientTaxSchema>;

export type InsertTax = z.infer<typeof insertTaxSchema>;
