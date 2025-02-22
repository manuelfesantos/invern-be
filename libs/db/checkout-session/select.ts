import {
  CheckoutSession,
  checkoutSessionSchema,
} from "@checkout-session-entity";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { checkoutSessionsTable } from "@schema";

export const selectCheckoutSessionById = async (
  id: string,
): Promise<CheckoutSession | undefined> =>
  checkoutSessionSchema.optional().parse(
    await db()
      .query.checkoutSessionsTable.findFirst({
        where: eq(checkoutSessionsTable.id, id),
      })
      .execute(),
  );
