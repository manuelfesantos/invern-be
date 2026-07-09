import { updateStripeTax } from "@stripe-adapter";
import { getDeleteTaxAction, getSelectTaxByIdAction } from "@tax-db";
import { errors } from "@error-handling-utils";

/**
 * Removes a tax: archives the Stripe TaxRate (they can't be hard-deleted, only
 * deactivated, so it stops applying at checkout) and deletes the D1 row.
 */
export const deleteTax = async (id: string): Promise<void> => {
  const existing = await getSelectTaxByIdAction(id).run();
  if (!existing) {
    throw errors.TAX_NOT_FOUND();
  }
  await updateStripeTax(id, { active: false });
  await getDeleteTaxAction(id).run();
};
