import { checkoutSessionsTable } from "@schema";
import { createSelectSchema } from "drizzle-zod";
import { optional, z } from "zod";
import { productIdAndQuantityArraySchema } from "@product-entity";
import {
  positiveIntegerSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";

export const checkoutSessionSchema = createSelectSchema(checkoutSessionsTable, {
  id: uuidSchema("checkout session id"),
  cartId: optional(uuidSchema("cart id")),
  createdAt: requiredStringSchema("checkout session creation date"),
  userId: optional(uuidSchema("user id")),
  expiresAt: positiveIntegerSchema("checkout session expiration date"),
});
export const insertCheckoutSessionSchema = checkoutSessionSchema
  .omit({
    products: true,
  })
  .merge(
    z.object({
      products: productIdAndQuantityArraySchema,
    }),
  );

export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;

export type InsertCheckoutSession = z.infer<typeof insertCheckoutSessionSchema>;
