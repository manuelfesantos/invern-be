import type {
  CheckoutSession,
  InsertCheckoutSession} from "@checkout-session-entity";
import {
  checkoutSessionSchema
} from "@checkout-session-entity";
import { db } from "@db";
import { checkoutSessionsTable } from "@schema";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";

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
