import { createSelectSchema } from "drizzle-zod";
import { ordersTable } from "@schema";
import { z } from "zod";
import { extendedProductSchema, lineItemSchema } from "@product-entity";
import {
  addressSchema,
  clientAddressSchema,
  simpleAddressSchema,
} from "@address-entity";
import { clientPaymentSchema } from "@payment-entity";
import { extendedClientTaxSchema } from "@tax-entity";
import { clientCurrencySchema } from "@currency-entity";

const baseOrderSchema = createSelectSchema(ordersTable);

export const insertOrderSchema = createSelectSchema(ordersTable).omit({
  createdAt: true,
});

export const orderSchema = baseOrderSchema
  .omit({ userId: true, addressId: true, paymentId: true })
  .merge(
    z.object({
      products: z.array(lineItemSchema),
      address: addressSchema,
      payment: clientPaymentSchema.nullable(),
    }),
  );

export const clientOrderSchema = orderSchema
  .omit({
    stripeId: true,
    address: true,
    snapshot: true,
  })
  .merge(
    z.object({
      address: clientAddressSchema,
    }),
  );

export const extendedClientOrderSchema = clientOrderSchema.extend({
  products: extendedProductSchema.array(),
  taxes: extendedClientTaxSchema.array(),
  currency: clientCurrencySchema,
  address: simpleAddressSchema,
});

export type ClientOrder = z.infer<typeof clientOrderSchema>;
export type ExtendedClientOrder = z.infer<typeof extendedClientOrderSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const invalidateCheckoutCookiePayloadSchema = z.object({
  checkoutSessionId: z.string(),
  expiresAt: z.number(),
});
