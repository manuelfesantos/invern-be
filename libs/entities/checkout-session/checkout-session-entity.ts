import { checkoutSessionsTable } from "@schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { productIdAndQuantityArraySchema } from "@product-entity";

export const checkoutSessionSchema = createSelectSchema(checkoutSessionsTable);
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
