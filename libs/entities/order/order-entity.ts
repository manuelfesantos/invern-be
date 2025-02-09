import { createSelectSchema } from "drizzle-zod";
import { ordersTable } from "@schema";
import { z } from "zod";
import { extendedProductSchema, lineItemSchema } from "@product-entity";
import { addressSchema } from "@address-entity";
import { clientPaymentSchema } from "@payment-entity";
import { extendedClientTaxSchema } from "@tax-entity";
import { clientCurrencySchema } from "@currency-entity";
import { requiredStringSchema, uuidSchema } from "@global-entity";

const baseOrderSchema = createSelectSchema(ordersTable, {
  id: uuidSchema("order id"),
  userId: z.optional(uuidSchema("user id")),
  paymentId: z.optional(requiredStringSchema("payment id")),
  stripeId: requiredStringSchema("stripe id"),
  snapshot: z.optional(requiredStringSchema("snapshot")),
  createdAt: requiredStringSchema("created at"),
});

export const insertOrderSchema = baseOrderSchema.omit({
  createdAt: true,
});

export const orderSchema = baseOrderSchema
  .omit({ userId: true, paymentId: true })
  .extend({
    products: z.array(lineItemSchema),
    address: addressSchema,
    payment: clientPaymentSchema.nullable(),
  });

export const clientOrderSchema = orderSchema
  .omit({
    stripeId: true,
    snapshot: true,
  })
  .extend({
    address: addressSchema,
  });

export const extendedClientOrderSchema = clientOrderSchema.extend({
  products: extendedProductSchema.array(),
  taxes: extendedClientTaxSchema.array(),
  currency: clientCurrencySchema,
});

export type ClientOrder = z.infer<typeof clientOrderSchema>;
export type ExtendedClientOrder = z.infer<typeof extendedClientOrderSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const invalidateCheckoutCookiePayloadSchema = z.object({
  checkoutSessionId: requiredStringSchema("checkout session id"),
  expiresAt: requiredStringSchema("expires at"),
});
