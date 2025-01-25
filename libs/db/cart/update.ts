import { InsertCart } from "@cart-entity";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";

export const updateCart = async (
  cartId: string,
  changes: Partial<InsertCart>,
): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .update(cartsTable)
    .set(changes)
    .where(eq(cartsTable.id, cartId));
};
