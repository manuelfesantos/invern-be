import {
  CheckoutSession,
  checkoutSessionSchema,
  InsertCheckoutSession,
} from "@checkout-session-entity";
import { db } from "@db";
import { checkoutSessionsTable } from "@schema";

export const insertCheckoutSession = async (
  insertCheckoutSession: InsertCheckoutSession,
): Promise<CheckoutSession[]> => {
  return checkoutSessionSchema
    .array()
    .parse(
      await db()
        .insert(checkoutSessionsTable)
        .values(insertCheckoutSession)
        .returning(),
    );
};
