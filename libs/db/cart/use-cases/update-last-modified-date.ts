import { db } from "@db";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";

export const updateCartLastModifiedDate = async (
  cartId: string,
): Promise<void> => {
  await db()
    .update(cartsTable)
    .set({ lastModifiedAt: Date.now() })
    .where(eq(cartsTable.id, cartId));
};
