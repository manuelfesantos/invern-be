import {
  getDeleteShippingRateAction,
  getSelectShippingRateByIdAction,
} from "@shipping-db";
import { errors } from "@error-handling-utils";

/**
 * Deletes a shipping rate. Cascades to its `shippingRatesToCountries` rows
 * (schema `onDelete: "cascade"`). Historical orders are unaffected (they store a
 * serialized shippingMethod snapshot, not a foreign key).
 */
export const deleteShippingRate = async (rateId: string): Promise<void> => {
  const existing = await getSelectShippingRateByIdAction(rateId).run();
  if (!existing) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }
  await getDeleteShippingRateAction(rateId).run();
};
