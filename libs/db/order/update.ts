import { InsertOrder } from "@order-entity";
import { db } from "@db";
import { ordersTable } from "@schema";
import { eq } from "drizzle-orm";

export const updateOrder = async (
  orderId: string,
  changes: Partial<InsertOrder>,
): Promise<void> => {
  await db()
    .update(ordersTable)
    .set(changes)
    .where(eq(ordersTable.id, orderId));
};
