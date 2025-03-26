import {
  EssentialShippingMethod,
  InsertShippingMethod,
  ShippingMethod,
} from "@shipping-entity";
import { getRandomUUID } from "@crypto-utils";
import { db } from "@db";
import { shippingMethodsTable } from "@schema";

export const insertShippingMethod = async (
  insertShippingMethod: EssentialShippingMethod,
): Promise<ShippingMethod> => {
  const shippingMethod: InsertShippingMethod = {
    ...insertShippingMethod,
    id: getRandomUUID(),
  };
  const [newShippingMethod] = await db()
    .insert(shippingMethodsTable)
    .values(shippingMethod)
    .returning()
    .execute();

  return {
    ...newShippingMethod,
    rates: [],
  };
};
