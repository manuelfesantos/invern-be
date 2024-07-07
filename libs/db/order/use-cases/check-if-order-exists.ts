import { ordersTable } from "@schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

export const checkIfOrderExists = async (orderId: string): Promise<boolean> => {
  const order = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.orderId, orderId),
    columns: {
      orderId: true,
    },
  });

  return order !== undefined;
};
