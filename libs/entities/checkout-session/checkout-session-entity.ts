import { checkoutSessionsTable } from "@schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { lineItemSchema } from "@product-entity";
import { selectedShippingMethodSchema } from "@shipping-entity";
import { countrySchema } from "@country-entity";
import { addressSchema } from "@address-entity";
import { userDetailsSchema } from "@user-entity";

export const insertCheckoutSessionSchema = createInsertSchema(
  checkoutSessionsTable,
  {
    id: z.string().nonempty(),
    cartId: z.uuidv4(),
    createdAt: z.iso.datetime({ local: true }),
    userId: z.uuidv4().nullable(),
    expiresAt: z.iso.datetime({ local: true }),
    products: lineItemSchema
      .array()
      .transform((value) => JSON.stringify(value)),
    shippingMethod: selectedShippingMethodSchema.transform((value) =>
      JSON.stringify(value),
    ),
    country: countrySchema.transform((value) => JSON.stringify(value)),
    address: addressSchema.transform((value) => JSON.stringify(value)),
    orderId: z.uuidv4(),
    personalDetails: userDetailsSchema.transform((value) =>
      JSON.stringify(value),
    ),
  },
);

export const checkoutSessionSchema = createSelectSchema(checkoutSessionsTable, {
  id: insertCheckoutSessionSchema.shape.id,
  cartId: insertCheckoutSessionSchema.shape.cartId,
  createdAt: insertCheckoutSessionSchema.shape.createdAt,
  lastModifiedAt: insertCheckoutSessionSchema.shape.lastModifiedAt,
  userId: insertCheckoutSessionSchema.shape.userId.nullable(),
  expiresAt: insertCheckoutSessionSchema.shape.expiresAt,
  products: z
    .string()
    .transform((value: string) =>
      lineItemSchema.array().parse(JSON.parse(value)),
    ),
  shippingMethod: z
    .string()
    .transform((value: string) =>
      selectedShippingMethodSchema.parse(JSON.parse(value)),
    ),
  country: z
    .string()
    .transform((value: string) => countrySchema.parse(JSON.parse(value))),
  address: z
    .string()
    .transform((value: string) => addressSchema.parse(JSON.parse(value))),
  orderId: insertCheckoutSessionSchema.shape.orderId,
  personalDetails: z
    .string()
    .transform((value: string) => userDetailsSchema.parse(JSON.parse(value))),
});

export type InsertCheckoutSession = z.infer<typeof insertCheckoutSessionSchema>;
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
