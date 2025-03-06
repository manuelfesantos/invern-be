import { PaymentMethod } from "@payment-entity";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { paymentMethodsTable } from "@schema";

export const selectPaymentMethodById = async (
  paymentMethodId: string,
): Promise<PaymentMethod | undefined> =>
  await db().query.paymentMethodsTable.findFirst({
    where: eq(paymentMethodsTable.id, paymentMethodId),
  });
