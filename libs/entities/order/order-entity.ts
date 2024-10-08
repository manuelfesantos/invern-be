import { createSelectSchema } from "drizzle-zod";
import { ordersTable } from "@schema";
import { z } from "zod";
import { lineItemSchema } from "@product-entity";
import { addressSchema } from "@address-entity";
import { clientPaymentSchema } from "@payment-entity";

const baseOrderSchema = createSelectSchema(ordersTable);

export const insertOrderSchema = createSelectSchema(ordersTable).omit({
  createdAt: true,
});

export const orderSchema = baseOrderSchema
  .omit({ userId: true, addressId: true, paymentId: true })
  .merge(
    z.object({
      products: z.array(lineItemSchema),
      address: addressSchema.nullable(),
      payment: clientPaymentSchema.nullable(),
    }),
  );

export const clientOrderSchema = orderSchema.omit({
  orderId: true,
});

export type ClientOrder = z.infer<typeof clientOrderSchema>;
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const invalidateCheckoutCookiePayloadSchema = z.object({
  checkoutSessionId: z.string(),
  expiresAt: z.number(),
});
