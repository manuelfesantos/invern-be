import { db } from "@db";
import { ordersTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteOrder = async (orderId: string): Promise<void> => {
  await db().delete(ordersTable).where(eq(ordersTable.id, orderId));
};
