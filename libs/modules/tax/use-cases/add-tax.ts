import * as z from "zod";
import type { AdminTax } from "@tax-entity";
import { createStripeTax } from "@stripe-adapter";
import { getSelectCountryByCodeAction } from "@country-db";
import { getInsertTaxAction, getSelectTaxByIdAction } from "@tax-db";
import { rateToPercentage } from "@number-utils";
import { errors } from "@error-handling-utils";

/** `rate` is a fraction (0.23 = 23%), matching how the extender applies it. */
const addTaxSchema = z.object({
  name: z.string().nonempty(),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  rate: z.number().min(0).max(1),
  inclusive: z.boolean().optional(),
  description: z.string().optional(),
});

/**
 * Creates a tax as a Stripe TaxRate FIRST, then stores a D1 row keyed by that
 * Stripe id — because checkout charges tax via `tax_rates: [tax.id]`, the id
 * must be a real `txr_…`. Stripe wants a percentage; we persist the fraction.
 */
export const addTax = async (body: unknown): Promise<AdminTax> => {
  const { name, countryCode, rate, inclusive, description } =
    addTaxSchema.parse(body);

  const country = await getSelectCountryByCodeAction(countryCode).run();
  if (!country) {
    throw errors.UNKNOWN_COUNTRY_CODES(countryCode);
  }

  const stripeTax = await createStripeTax({
    countryCode,
    name,
    inclusive: inclusive ?? false,
    percentage: rateToPercentage(rate),
    description: description ?? name,
  });

  await getInsertTaxAction({ id: stripeTax.id, name, rate, countryCode }).run();

  const created = await getSelectTaxByIdAction(stripeTax.id).run();
  if (!created) {
    throw errors.TAX_NOT_FOUND();
  }
  return created;
};
