import { db } from "@db";
import { contextStore } from "@context-utils";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";

export const emptyCart = async (cartId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(cartsTable)
    .where(eq(cartsTable.id, cartId));
};
