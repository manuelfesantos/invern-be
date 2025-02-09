import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { paymentsTable } from "@schema";
import { z } from "zod";
import {
  positiveIntegerSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";

export const paymentMethodTypeSchema = z.enum(paymentsTable.type.enumValues, {
  required_error: "payment method type is required",
  invalid_type_error: "payment method type should be a text",
});
export const PaymentMethodType = paymentMethodTypeSchema.Enum;

export const paymentIntentStateSchema = z.enum(paymentsTable.state.enumValues, {
  required_error: "payment intent state is required",
  invalid_type_error: "payment intent state should be a text",
});
export const PaymentIntentState = paymentIntentStateSchema.Enum;

const basePaymentSchema = createSelectSchema(paymentsTable, {
  id: uuidSchema("payment id"),
  type: paymentMethodTypeSchema,
  state: paymentIntentStateSchema,
  createdAt: requiredStringSchema("payment created at date"),
  netAmount: positiveIntegerSchema("payment net amount"),
  grossAmount: positiveIntegerSchema("payment gross amount"),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable, {
  id: uuidSchema("payment id"),
  type: paymentMethodTypeSchema,
  state: paymentIntentStateSchema,
  createdAt: requiredStringSchema("payment created at date"),
  netAmount: positiveIntegerSchema("payment net amount"),
  grossAmount: positiveIntegerSchema("payment gross amount"),
}).omit({
  createdAt: true,
});

export const paymentSchema = basePaymentSchema;

export const clientPaymentSchema = paymentSchema.omit({
  id: true,
});
export type PaymentIntentStateType = z.infer<typeof paymentIntentStateSchema>;

export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
