import { ordersTable } from "@schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const checkIfOrderExistsQuery = async (orderId: string): Promise<boolean> => {
  const order = await db().query.ordersTable.findFirst({
    where: eq(ordersTable.id, orderId),
    columns: {
      id: true,
    },
  });

  return order !== undefined;
};

export const getCheckIfOrderExistsAction = actionBuilder(
  checkIfOrderExistsQuery,
);
