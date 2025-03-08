import { db } from "@db";
import { checkoutSessionsTable } from "@schema";
import { eq, lte } from "drizzle-orm";
import {
  CheckoutSession,
  checkoutSessionSchema,
} from "@checkout-session-entity";
import { getDateTime } from "@timer-utils";

export const deleteCheckoutSessionById = async (
  id: string,
): Promise<{ checkoutSessionId: string }[]> => {
  return db()
    .delete(checkoutSessionsTable)
    .where(eq(checkoutSessionsTable.id, id))
    .returning({
      checkoutSessionId: checkoutSessionsTable.id,
    });
};

export const popCheckoutSessionById = async (
  id: string,
): Promise<CheckoutSession[]> => {
  return checkoutSessionSchema
    .array()
    .parse(
      await db()
        .delete(checkoutSessionsTable)
        .where(eq(checkoutSessionsTable.id, id))
        .returning(),
    );
};

export const popExpiredCheckoutSessions = async (): Promise<
  CheckoutSession[]
> => {
  return checkoutSessionSchema
    .array()
    .parse(
      await db()
        .delete(checkoutSessionsTable)
        .where(lte(checkoutSessionsTable.expiresAt, getDateTime()))
        .returning(),
    );
};
