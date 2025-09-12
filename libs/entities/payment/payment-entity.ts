import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { paymentMethodsTable, paymentsTable } from "@schema";
import * as z from "zod";

export const paymentMethodTypeSchema = z.enum(
  paymentMethodsTable.type.enumValues,
  {
    error: (issue) =>
      issue.input === undefined
        ? "payment method type is required"
        : "invalid payment method type",
  },
);
export const PaymentMethodType = paymentMethodTypeSchema.enum;

export const paymentIntentStateSchema = z.enum(paymentsTable.state.enumValues, {
  error: (issue) =>
    issue.input === undefined
      ? "payment intent state is required"
      : "invalid payment intent state",
});
export const PaymentIntentState = paymentIntentStateSchema.enum;

const basePaymentSchema = createSelectSchema(paymentsTable, {
  id: z.string().nonempty(),
  state: paymentIntentStateSchema,
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
  netAmount: z.int().nonnegative(),
  grossAmount: z.int().nonnegative(),
  paymentMethodId: z.string().nonempty().nullable(),
});

export const basePaymentMethodSchema = createSelectSchema(paymentMethodsTable, {
  id: z.string().nonempty(),
  type: paymentMethodTypeSchema,
  brand: z.string().nonempty().nullable(),
  last4: z.string().nonempty().nullable(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
});

export const insertPaymentMethodSchema = createInsertSchema(
  paymentMethodsTable,
  {
    id: basePaymentMethodSchema.shape.id,
    type: basePaymentMethodSchema.shape.type,
    brand: basePaymentMethodSchema.shape.brand,
    last4: basePaymentMethodSchema.shape.last4,
  },
).omit({
  createdAt: true,
  lastModifiedAt: true,
});

export const clientPaymentMethodSchema = basePaymentMethodSchema.omit({
  id: true,
});

export const insertPaymentSchema = basePaymentSchema.omit({
  createdAt: true,
  lastModifiedAt: true,
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
