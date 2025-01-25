import { InsertOrder } from "@order-entity";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { ordersTable } from "@schema";
import { eq } from "drizzle-orm";

export const updateOrder = async (
  orderId: string,
  changes: Partial<InsertOrder>,
): Promise<void> => {
  await (
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    contextStore.context.transaction ??
    db()
  )
    .update(ordersTable)
    .set(changes)
    .where(eq(ordersTable.id, orderId));
};
