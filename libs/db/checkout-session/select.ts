import {
  CheckoutSession,
  checkoutSessionSchema,
} from "@checkout-session-entity";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { eq } from "drizzle-orm";
import { checkoutSessionsTable } from "@schema";
import { z } from "zod";

export const selectCheckoutSessionById = async (
  id: string,
): Promise<CheckoutSession | undefined> => {
  return z.optional(checkoutSessionSchema).parse(
    await (
      contextStore.context.transaction ?? db()
    ).query.checkoutSessionsTable.findFirst({
      where: eq(checkoutSessionsTable.id, id),
    }),
  );
};
