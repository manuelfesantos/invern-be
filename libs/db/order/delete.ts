import { db } from "@db";
import { contextStore } from "@context-utils";
import { ordersTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteOrder = async (orderId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(ordersTable)
    .where(eq(ordersTable.id, orderId));
};
