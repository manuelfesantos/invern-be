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
// `id` is kept: it is the Stripe TaxRate id (`txr_…`) — the same id checkout
// passes to Stripe as `tax_rates` — so it is supplied by the caller (from
// Stripe on create), never generated.
export const insertTaxSchema = createInsertSchema(taxesTable);

export const taxSchema = baseTaxSchema.omit({ countryCode: true });

// Admin view keeps `countryCode` — the taxes admin surface manages per-country
// rates, so the country a tax belongs to is part of the record.
export const adminTaxSchema = baseTaxSchema;

export const clientTaxSchema = taxSchema.omit({
  id: true,
  createdAt: true,
  lastModifiedAt: true,
});

export const extendedClientTaxSchema = clientTaxSchema.extend({
  amount: z.number().nonnegative(),
});

export type Tax = z.infer<typeof taxSchema>;

export type AdminTax = z.infer<typeof adminTaxSchema>;

export type ExtendedClientTax = z.infer<typeof extendedClientTaxSchema>;

export type InsertTax = z.infer<typeof insertTaxSchema>;
