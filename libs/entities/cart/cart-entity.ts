import { z } from "zod";
import { uuidSchema } from "@global-entity";
import { cartItemSchema } from "./cart-item-entity";

export const cartSchema = z.object({
  cartId: uuidSchema("cart id"),
  products: z.array(cartItemSchema).default([]),
});

export type Cart = z.infer<typeof cartSchema>;
