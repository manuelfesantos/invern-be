import { InsertOrder } from "@order-entity";
import { db } from "@db";
import { ordersTable } from "@schema";
import { eq } from "drizzle-orm";
import { actionBuilder } from "@generics-db";

const updateOrderQuery = (orderId: string, changes: Partial<InsertOrder>) =>
  db().update(ordersTable).set(changes).where(eq(ordersTable.id, orderId));

export const getUpdateOrderAction = actionBuilder(updateOrderQuery);
