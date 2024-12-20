import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const deleteCart = async (cartId: string): Promise<void> => {
  await db().delete(cartsTable).where(eq(cartsTable.id, cartId));
};
