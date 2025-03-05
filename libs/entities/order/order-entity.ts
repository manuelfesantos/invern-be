import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { ordersTable } from "@schema";
import { extendedProductSchema, lineItemSchema } from "@product-entity";
import { addressSchema } from "@address-entity";
import { clientPaymentSchema } from "@payment-entity";
import { extendedClientTaxSchema } from "@tax-entity";
import { clientCurrencySchema } from "@currency-entity";
import { requiredStringSchema, uuidSchema } from "@global-entity";
import { countrySchema } from "@country-entity";
import { selectedShippingMethodSchema } from "@shipping-entity";
import { userDetailsSchema } from "@user-entity";
import { shippingTransactionSchema } from "@shipping-transaction-entity";
import { z } from "zod";

const orderStatusSchema = z.enum([
  "processing_payment",
  "packaging",
  "shipping",
  "completed",
  "canceled",
  "error",
]);

export const baseOrderSchema = createSelectSchema(ordersTable, {
  id: uuidSchema("order id"),
  userId: z.optional(uuidSchema("user id")),
  paymentId: z.optional(requiredStringSchema("payment id")),
  stripeId: requiredStringSchema("stripe id"),
  createdAt: requiredStringSchema("created at"),
  products: requiredStringSchema("products").transform((value) =>
    lineItemSchema.array().parse(JSON.parse(value)),
  ),
  address: requiredStringSchema("address").transform((value) =>
    addressSchema.parse(JSON.parse(value)),
  ),
  country: requiredStringSchema("country").transform((value) =>
    countrySchema.parse(JSON.parse(value)),
  ),
  shippingMethod: requiredStringSchema("shipping method").transform((value) =>
    selectedShippingMethodSchema.parse(JSON.parse(value)),
  ),
  shippingTransactionId: uuidSchema("shipping transaction id"),
  personalDetails: requiredStringSchema("order personal details").transform(
    (value) => userDetailsSchema.parse(JSON.parse(value)),
  ),
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
  personalDetails: userDetailsSchema.transform((value) =>
    JSON.stringify(value),
  ),
});

export const orderSchema = baseOrderSchema
  .omit({ userId: true, paymentId: true, shippingTransactionId: true })
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
});

export const extendedClientOrderSchema = clientOrderSchema.extend({
  products: extendedProductSchema.array(),
  taxes: extendedClientTaxSchema.array(),
  currency: clientCurrencySchema,
  status: orderStatusSchema,
});

export type ClientOrder = z.infer<typeof clientOrderSchema>;
export type ExtendedClientOrder = z.infer<typeof extendedClientOrderSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type BaseOrder = z.infer<typeof baseOrderSchema>;

export const invalidateCheckoutCookiePayloadSchema = z.object({
  checkoutSessionId: requiredStringSchema("checkout session id"),
  expiresAt: requiredStringSchema("expires at"),
});

export const OrderStatus = orderStatusSchema.Enum;
export type OrderStatusType = z.infer<typeof orderStatusSchema>;
