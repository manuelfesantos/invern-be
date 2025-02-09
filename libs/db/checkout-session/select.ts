import { CheckoutSession } from "@checkout-session-entity";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { checkoutSessionsTable } from "@schema";

export const selectCheckoutSessionById = async (
  id: string,
): Promise<CheckoutSession | undefined> =>
  db()
    .query.checkoutSessionsTable.findFirst({
      where: eq(checkoutSessionsTable.id, id),
    })
    .execute();
