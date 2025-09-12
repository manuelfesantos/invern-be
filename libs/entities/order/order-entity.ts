import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { ordersTable } from "@schema";
import { extendedLineItemSchema, lineItemSchema } from "@product-entity";
import { addressSchema } from "@address-entity";
import { clientPaymentSchema } from "@payment-entity";
import { extendedClientTaxSchema } from "@tax-entity";
import { clientCurrencySchema } from "@currency-entity";
import { countrySchema } from "@country-entity";
import { selectedShippingMethodSchema } from "@shipping-entity";
import { userDetailsSchema } from "@user-entity";
import { shippingTransactionSchema } from "@shipping-transaction-entity";
import * as z from "zod";

const orderStatusSchema = z.enum([
  "processing_payment",
  "packaging",
  "shipping",
  "completed",
  "canceled",
  "error",
]);

export const baseOrderSchema = createSelectSchema(ordersTable, {
  id: z.uuidv4(),
  userId: z.uuidv4().nullable(),
  paymentId: z.string().nonempty().optional(),
  stripeId: z.string().nonempty(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
  products: z
    .string()
    .transform((value) => lineItemSchema.array().parse(JSON.parse(value))),
  address: z
    .string()
    .transform((value) => addressSchema.parse(JSON.parse(value))),
  country: z
    .string()
    .transform((value) => countrySchema.parse(JSON.parse(value))),
  shippingMethod: z
    .string()
    .transform((value) =>
      selectedShippingMethodSchema.parse(JSON.parse(value)),
    ),
  shippingTransactionId: z.uuidv4(),
  personalDetails: z
    .string()
    .transform((value) => userDetailsSchema.parse(JSON.parse(value))),
});

export const insertOrderSchema = createInsertSchema(ordersTable, {
  id: baseOrderSchema.shape.id,
  userId: baseOrderSchema.shape.userId,
  paymentId: baseOrderSchema.shape.paymentId,
  stripeId: baseOrderSchema.shape.stripeId,
  createdAt: baseOrderSchema.shape.createdAt,
  shippingTransactionId: baseOrderSchema.shape.shippingTransactionId,
  shippingMethod: selectedShippingMethodSchema.transform((value) =>
    JSON.stringify(value),
  ),
  products: lineItemSchema.array().transform((value) => JSON.stringify(value)),
  country: countrySchema.transform((value) => JSON.stringify(value)),
  address: addressSchema.transform((value) => JSON.stringify(value)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personalDetails: userDetailsSchema.transform((value: any) =>
    JSON.stringify(value),
  ),
});

export const orderSchema = baseOrderSchema
  .omit({ paymentId: true, shippingTransactionId: true })
  .extend({
    products: z.array(lineItemSchema),
    address: addressSchema,
    payment: clientPaymentSchema.nullable(),
    country: countrySchema,
    personalDetails: userDetailsSchema,
    shippingMethod: selectedShippingMethodSchema,
    shippingTransaction: shippingTransactionSchema,
  });

export const clientOrderSchema = orderSchema.omit({
  stripeId: true,
  userId: true,
});

export const extendedClientOrderSchema = clientOrderSchema
  .extend({
    products: extendedLineItemSchema.array(),
    taxes: extendedClientTaxSchema.array(),
    currency: clientCurrencySchema,
    status: orderStatusSchema,
  })
  .omit({
    country: true,
  });

export type ClientOrder = z.infer<typeof clientOrderSchema>;
export type ExtendedClientOrder = z.infer<typeof extendedClientOrderSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type BaseOrder = z.infer<typeof baseOrderSchema>;

export const invalidateCheckoutCookiePayloadSchema = z.object({
  checkoutSessionId: z.string().nonempty(),
  expiresAt: z.string().nonempty(),
});

export const OrderStatus = orderStatusSchema.enum;
export type OrderStatusType = z.infer<typeof orderStatusSchema>;
