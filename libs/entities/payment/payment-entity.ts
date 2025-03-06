import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { paymentMethodsTable, paymentsTable } from "@schema";
import { z } from "zod";
import {
  positiveIntegerSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";

export const paymentMethodTypeSchema = z.enum(
  paymentMethodsTable.type.enumValues,
  {
    required_error: "payment method type is required",
    invalid_type_error: "payment method type should be a text",
  },
);
export const PaymentMethodType = paymentMethodTypeSchema.Enum;

export const paymentIntentStateSchema = z.enum(paymentsTable.state.enumValues, {
  required_error: "payment intent state is required",
  invalid_type_error: "payment intent state should be a text",
});
export const PaymentIntentState = paymentIntentStateSchema.Enum;

const basePaymentSchema = createSelectSchema(paymentsTable, {
  id: uuidSchema("payment id"),
  state: paymentIntentStateSchema,
  createdAt: requiredStringSchema("payment created at date"),
  netAmount: positiveIntegerSchema("payment net amount").optional(),
  grossAmount: positiveIntegerSchema("payment gross amount"),
  paymentMethodId: requiredStringSchema("payment method id").optional(),
});

export const basePaymentMethodSchema = createSelectSchema(paymentMethodsTable, {
  id: requiredStringSchema("payment method id"),
  type: paymentMethodTypeSchema,
  brand: requiredStringSchema("payment method brand").optional(),
  last4: requiredStringSchema("payment method last 4").optional(),
});

export const insertPaymentMethodSchema = createInsertSchema(
  paymentMethodsTable,
  {
    id: basePaymentMethodSchema.shape.id,
    type: basePaymentMethodSchema.shape.type,
    brand: basePaymentMethodSchema.shape.brand,
    last4: basePaymentMethodSchema.shape.last4,
  },
);

export const clientPaymentMethodSchema = basePaymentMethodSchema.omit({
  id: true,
});

export const insertPaymentSchema = basePaymentSchema.omit({
  createdAt: true,
});

export const paymentSchema = basePaymentSchema;

export const clientPaymentSchema = paymentSchema
  .omit({
    id: true,
  })
  .extend({
    paymentMethod: clientPaymentMethodSchema.nullable(),
  });
export type PaymentIntentStateType = z.infer<typeof paymentIntentStateSchema>;

export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = z.infer<typeof basePaymentMethodSchema>;
