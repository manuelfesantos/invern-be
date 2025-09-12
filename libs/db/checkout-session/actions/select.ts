import { db } from "@db";
import { eq } from "drizzle-orm";
import { checkoutSessionsTable } from "@schema";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";
import type { CheckoutSession } from "@checkout-session-entity";
import { checkoutSessionSchema } from "@checkout-session-entity";

const selectCheckoutSessionByIdQuery = (id: string) =>
  db().query.checkoutSessionsTable.findFirst({
    where: eq(checkoutSessionsTable.id, id),
  });

const mapOptionalCheckoutSessionFromQuery = (
  queryResult: Result<typeof selectCheckoutSessionByIdQuery>,
): CheckoutSession | undefined =>
  checkoutSessionSchema.optional().parse(queryResult);

const selectCheckoutSessionsQuery = () =>
  db().query.checkoutSessionsTable.findMany();

const mapCheckoutSessionsFromQueryResult = (
  queryResult: Result<typeof selectCheckoutSessionsQuery>,
): CheckoutSession[] => {
  return checkoutSessionSchema.array().parse(queryResult);
};

export const getSelectCheckoutSessionByIdAction = actionBuilder(
  selectCheckoutSessionByIdQuery,
  mapOptionalCheckoutSessionFromQuery,
);
export const getSelectCheckoutSessionsAction = actionBuilder(
  selectCheckoutSessionsQuery,
  mapCheckoutSessionsFromQueryResult,
);
