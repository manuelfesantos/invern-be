import type { ShippingMethod } from "@shipping-entity";
import { essentialShippingMethodSchema } from "@shipping-entity";
import { getInsertShippingMethodAction } from "@shipping-db";

export const addShippingMethod = async (
  body: unknown,
): Promise<ShippingMethod> => {
  const insert = essentialShippingMethodSchema.parse(body);
  return getInsertShippingMethodAction(insert).run();
};
