import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { cartsTable } from "@schema";
import { z } from "zod";
import { lineItemSchema } from "@product-entity";

const baseCartSchema = createSelectSchema(cartsTable);

export const insertCartSchema = createInsertSchema(cartsTable).omit({
  id: true,
});

export const cartSchema = baseCartSchema.merge(
  z.object({
    products: z.array(lineItemSchema).optional(),
  }),
);

export const toCartDTO = (cart: Cart): CartDTO => {
  return cartDTOSchema.parse(cart);
};

export const cartDTOSchema = cartSchema.omit({
  id: true,
});

export type CartDTO = z.infer<typeof cartDTOSchema>;

export type Cart = z.infer<typeof cartSchema>;

export type InsertCart = z.infer<typeof insertCartSchema>;
