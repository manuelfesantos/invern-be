import {
  CheckoutSession,
  checkoutSessionSchema,
  InsertCheckoutSession,
} from "@checkout-session-entity";
import { db } from "@db";
import { checkoutSessionsTable } from "@schema";
import { actionBuilder, Result } from "@generics-db";

const insertCheckoutSessionQuery = (
  insertCheckoutSession: InsertCheckoutSession,
) =>
  db().insert(checkoutSessionsTable).values(insertCheckoutSession).returning();

const mapCheckoutSessionsFromInsertQueryResult = (
  queryResult: Result<typeof insertCheckoutSessionQuery>,
): CheckoutSession[] => {
  return checkoutSessionSchema.array().parse(queryResult);
};

export const getInsertCheckoutSessionAction = actionBuilder(
  insertCheckoutSessionQuery,
  mapCheckoutSessionsFromInsertQueryResult,
);
