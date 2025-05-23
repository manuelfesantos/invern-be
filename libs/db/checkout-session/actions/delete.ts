import {
  CheckoutSession,
  checkoutSessionSchema,
} from "@checkout-session-entity";
import { actionBuilder, Result } from "@generics-db";
import { db } from "@db";
import { checkoutSessionsTable } from "@schema";
import { eq, lte } from "drizzle-orm";
import { getDateTime } from "@timer-utils";

const popCheckoutSessionByIdQuery = (id: string) =>
  db()
    .delete(checkoutSessionsTable)
    .where(eq(checkoutSessionsTable.id, id))
    .returning();

const popExpiredCheckoutSessionsQuery = () =>
  db()
    .delete(checkoutSessionsTable)
    .where(lte(checkoutSessionsTable.expiresAt, getDateTime()))
    .returning();

const deleteCheckoutSessionByIdQuery = (id: string) =>
  db()
    .delete(checkoutSessionsTable)
    .where(eq(checkoutSessionsTable.id, id))
    .returning({
      checkoutSessionId: checkoutSessionsTable.id,
    });

const mapCheckoutSessionsFromPopQueryResult = (
  queryResult: Result<typeof popCheckoutSessionByIdQuery>,
): CheckoutSession[] => {
  return checkoutSessionSchema.array().parse(queryResult);
};

export const getPopCheckoutSessionByIdAction = actionBuilder(
  popCheckoutSessionByIdQuery,
  mapCheckoutSessionsFromPopQueryResult,
);

export const getPopExpiredCheckoutSessionsAction = actionBuilder(
  popExpiredCheckoutSessionsQuery,
  mapCheckoutSessionsFromPopQueryResult,
);

export const getDeleteCheckoutSessionByIdAction = actionBuilder(
  deleteCheckoutSessionByIdQuery,
);
