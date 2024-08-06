import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { paymentsTable } from "@schema";
import { z } from "zod";

const basePaymentSchema = createSelectSchema(paymentsTable);

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  createdAt: true,
});

export const paymentSchema = basePaymentSchema;

export const clientPaymentSchema = paymentSchema.omit({
  paymentId: true,
});

export const paymentMethodTypeSchema = z.enum(paymentsTable.type.enumValues);
export const PaymentMethodType = paymentMethodTypeSchema.Enum;

export const paymentIntentStateSchema = z.enum(paymentsTable.state.enumValues);
export const PaymentIntentState = paymentIntentStateSchema.Enum;
export type PaymentIntentStateType = z.infer<typeof paymentIntentStateSchema>;

export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
