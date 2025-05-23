import { db } from "@db";
import { ordersTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const deleteOrderQuery = (orderId: string) =>
  db().delete(ordersTable).where(eq(ordersTable.id, orderId));

export const getDeleteOrderAction = actionBuilder(deleteOrderQuery);
