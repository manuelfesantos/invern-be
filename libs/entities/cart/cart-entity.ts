import { z } from "zod";
import { productWithQuantitySchema } from "@product-entity";
import { uuidSchema } from "@global-entity";

export const cartSchema = z.object({
  cartId: uuidSchema("cart id"),
  products: z.array(productWithQuantitySchema).default([]),
});

export type Cart = z.infer<typeof cartSchema>;
