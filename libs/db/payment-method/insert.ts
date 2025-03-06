import { db } from "@db";
import { InsertPaymentMethod, PaymentMethod } from "@payment-entity";
import { paymentMethodsTable } from "@schema";

export const insertPaymentMethod = async (
  insertPaymentMethod: InsertPaymentMethod,
): Promise<PaymentMethod | undefined> => {
  const [paymentMethod] = await db()
    .insert(paymentMethodsTable)
    .values(insertPaymentMethod)
    .returning()
    .execute();

  return paymentMethod;
};
