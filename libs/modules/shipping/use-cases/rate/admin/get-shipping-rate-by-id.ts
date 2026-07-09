import type { ShippingRate } from "@shipping-entity";
import { getSelectShippingRateByIdAction } from "@shipping-db";
import { errors } from "@error-handling-utils";

export const getShippingRateById = async (
  id: string,
): Promise<ShippingRate> => {
  const rate = await getSelectShippingRateByIdAction(id).run();
  if (!rate) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }
  return rate;
};
