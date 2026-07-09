import {
  getDeleteShippingMethodAction,
  getSelectShippingMethodAction,
} from "@shipping-db";
import { errors } from "@error-handling-utils";

/**
 * Deletes a shipping method. Refuses (409) when the method still has rates —
 * the schema would cascade-delete them, but that is destructive and easy to do
 * by accident, so require the rates be removed/reassigned first. Historical
 * orders are unaffected (they store a serialized shippingMethod snapshot, not a
 * foreign key).
 */
export const deleteShippingMethod = async (id: string): Promise<void> => {
  const method = await getSelectShippingMethodAction(id).run();
  if (!method) {
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }
  if (method.rates.length) {
    throw errors.SHIPPING_METHOD_HAS_RATES();
  }
  await getDeleteShippingMethodAction(id).run();
};
