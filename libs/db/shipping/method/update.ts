import { BaseShippingMethod, InsertShippingMethod } from "@shipping-entity";
import { db } from "@db";
import { shippingMethodsTable } from "@schema";
import { eq } from "drizzle-orm";

export const updateShippingMethod = async (
  shippingMethodId: string,
  data: Partial<InsertShippingMethod>,
): Promise<BaseShippingMethod | undefined> => {
  const [updatedShippingMethod] = await db()
    .update(shippingMethodsTable)
    .set(data)
    .where(eq(shippingMethodsTable.id, shippingMethodId))
    .returning()
    .execute();

  return updatedShippingMethod;
};
