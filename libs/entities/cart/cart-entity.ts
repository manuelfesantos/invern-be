import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { cartsTable } from "@schema";
import { z } from "zod";
import { lineItemSchema } from "@product-entity";

const baseCartSchema = createSelectSchema(cartsTable);

export const insertCartSchema = createInsertSchema(cartsTable).omit({
  cartId: true,
});

export const cartSchema = baseCartSchema.omit({ userId: true }).merge(
  z.object({
    products: z.array(lineItemSchema).optional(),
  }),
);

export type Cart = z.infer<typeof cartSchema>;

export type InsertCart = z.infer<typeof insertCartSchema>;
