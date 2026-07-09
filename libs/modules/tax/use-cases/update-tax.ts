import * as z from "zod";
import type { AdminTax } from "@tax-entity";
import { updateStripeTax } from "@stripe-adapter";
import { getSelectTaxByIdAction, getUpdateTaxAction } from "@tax-db";
import { errors } from "@error-handling-utils";
import { runBatchOperation } from "@generics-db";

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

  // Batch the D1 name update (if any) with the re-select in one round-trip.
  let updateTaxAction: ReturnType<typeof getUpdateTaxAction> | undefined;
  if (changes.name !== undefined) {
    updateTaxAction = getUpdateTaxAction(id, { name: changes.name });
  }

  const [, updated] = await runBatchOperation(
    updateTaxAction,
    getSelectTaxByIdAction(id),
  );
  if (!updated) {
    throw errors.TAX_NOT_FOUND();
  }
  return updated;
};
