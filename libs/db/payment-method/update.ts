import { paymentMethodsTable } from "@schema";
import { eq } from "drizzle-orm";
import { PaymentMethod } from "@payment-entity";
import { db } from "@db";

export const updatePaymentMethod = async (
  paymentMethodId: string,
  updatePaymentMethod: Partial<PaymentMethod>,
): Promise<PaymentMethod | undefined> => {
  const [paymentMethod] = await db()
    .update(paymentMethodsTable)
    .set(updatePaymentMethod)
    .where(eq(paymentMethodsTable.id, paymentMethodId))
    .returning()
    .execute();

  return paymentMethod;
};
