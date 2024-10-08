import {
  CheckoutSession,
  InsertCheckoutSession,
} from "@checkout-session-entity";
import { db } from "@db";
import { checkoutSessionsTable } from "@schema";

export const insertCheckoutSession = async (
  insertCheckoutSession: InsertCheckoutSession,
): Promise<CheckoutSession[]> => {
  const checkoutSession = {
    ...insertCheckoutSession,
    products: JSON.stringify(insertCheckoutSession.products),
  };

  return db().insert(checkoutSessionsTable).values(checkoutSession).returning();
};
