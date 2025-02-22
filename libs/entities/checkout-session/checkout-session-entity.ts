import { checkoutSessionsTable } from "@schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { optional, z } from "zod";
import { lineItemSchema } from "@product-entity";
import {
  dateTimeSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";
import { selectedShippingMethodSchema } from "@shipping-entity";
import { countrySchema } from "@country-entity";
import { addressSchema } from "@address-entity";
import { userDetailsSchema } from "@user-entity";

export const insertCheckoutSessionSchema = createInsertSchema(
  checkoutSessionsTable,
  {
    id: requiredStringSchema("checkout session id"),
    cartId: optional(uuidSchema("cart id")),
    createdAt: dateTimeSchema("checkout session created at"),
    userId: optional(uuidSchema("user id")),
    expiresAt: dateTimeSchema("checkout session expiration date"),
    products: lineItemSchema
      .array()
      .transform((value) => JSON.stringify(value)),
    shippingMethod: selectedShippingMethodSchema.transform((value) =>
      JSON.stringify(value),
    ),
    country: countrySchema.transform((value) => JSON.stringify(value)),
    address: addressSchema.transform((value) => JSON.stringify(value)),
    orderId: uuidSchema("order id"),
    personalDetails: userDetailsSchema.transform((value) =>
      JSON.stringify(value),
    ),
  },
);

export const checkoutSessionSchema = createSelectSchema(checkoutSessionsTable, {
  id: insertCheckoutSessionSchema.shape.id,
  cartId: insertCheckoutSessionSchema.shape.cartId,
  createdAt: insertCheckoutSessionSchema.shape.createdAt,
  userId: insertCheckoutSessionSchema.shape.userId,
  expiresAt: insertCheckoutSessionSchema.shape.expiresAt,
  products: requiredStringSchema("checkout products").transform((value) =>
    lineItemSchema.array().parse(JSON.parse(value)),
  ),
  shippingMethod: requiredStringSchema("checkout shipping method").transform(
    (value) => selectedShippingMethodSchema.parse(JSON.parse(value)),
  ),
  country: requiredStringSchema("checkout country").transform((value) =>
    countrySchema.parse(JSON.parse(value)),
  ),
  address: requiredStringSchema("checkout address").transform((value) =>
    addressSchema.parse(JSON.parse(value)),
  ),
  orderId: insertCheckoutSessionSchema.shape.orderId,
  personalDetails: requiredStringSchema("checkout personal details").transform(
    (value) => userDetailsSchema.parse(JSON.parse(value)),
  ),
});

export type InsertCheckoutSession = z.infer<typeof insertCheckoutSessionSchema>;
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
