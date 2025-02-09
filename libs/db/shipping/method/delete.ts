import { shippingMethodsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { BaseShippingMethod } from "@shipping-entity";

export const deleteShippingMethod = async (
  id: string,
): Promise<BaseShippingMethod | undefined> => {
  const [deletedShippingMethod] = await db()
    .delete(shippingMethodsTable)
    .where(eq(shippingMethodsTable.id, id))
    .returning()
    .execute();

  return deletedShippingMethod;
};
