import type { ShippingMethod } from "@shipping-entity";
import { essentialShippingMethodSchema } from "@shipping-entity";
import { getUpdateShippingMethodAction } from "@shipping-db";
import { errors } from "@error-handling-utils";
import { getShippingMethodById } from "./get-shipping-method-by-id";

export const updateShippingMethod = async (
  id: string,
  body: unknown,
): Promise<ShippingMethod> => {
  const update = essentialShippingMethodSchema.parse(body);
  const updated = await getUpdateShippingMethodAction(id, update).run();
  if (!updated) {
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }
  // Re-read so the response is the full method (with its rates), consistent
  // with the detail endpoint.
  return getShippingMethodById(id);
};
