import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const deleteCart = async (cartId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(cartsTable)
    .where(eq(cartsTable.id, cartId));
};
