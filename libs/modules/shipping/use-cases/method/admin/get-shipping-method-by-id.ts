import type { ShippingMethod } from "@shipping-entity";
import { getSelectShippingMethodAction } from "@shipping-db";
import { errors } from "@error-handling-utils";

/** Admin method detail — includes ALL of the method's rates (unfiltered by weight). */
export const getShippingMethodById = async (
  id: string,
): Promise<ShippingMethod> => {
  const method = await getSelectShippingMethodAction(id).run();
  if (!method) {
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }
  return method;
};
