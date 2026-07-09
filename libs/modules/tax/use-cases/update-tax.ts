import * as z from "zod";
import type { AdminTax } from "@tax-entity";
import { updateStripeTax } from "@stripe-adapter";
import { getSelectTaxByIdAction, getUpdateTaxAction } from "@tax-db";
import { errors } from "@error-handling-utils";

// Only these are editable: a Stripe TaxRate's percentage (and thus `rate`) and
// its country are immutable — changing a rate means deactivating this tax and
// creating a new one.
const updateTaxSchema = z.object({
  name: z.string().nonempty().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

const IMMUTABLE_FIELDS = ["rate", "countryCode"] as const;

export const updateTax = async (
  id: string,
  body: unknown,
): Promise<AdminTax> => {
  if (body && typeof body === "object") {
    for (const field of IMMUTABLE_FIELDS) {
      if (field in body) {
        throw errors.TAX_IMMUTABLE_FIELD(field);
      }
    }
  }
  const changes = updateTaxSchema.parse(body);

  const existing = await getSelectTaxByIdAction(id).run();
  if (!existing) {
    throw errors.TAX_NOT_FOUND();
  }

  // Mirror to Stripe (the source of the charged rate). D1 only stores `name`;
  // description/active live solely in Stripe.
  const mirrors =
    changes.name !== undefined ||
    changes.description !== undefined ||
    changes.active !== undefined;
  if (mirrors) {
    await updateStripeTax(id, changes);
  }
  if (changes.name !== undefined) {
    await getUpdateTaxAction(id, { name: changes.name }).run();
  }

  const updated = await getSelectTaxByIdAction(id).run();
  if (!updated) {
    throw errors.TAX_NOT_FOUND();
  }
  return updated;
};
