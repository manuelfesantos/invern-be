import { z } from "zod";
import { productWithQuantitySchema } from "@product-entity";

export const cartSchema = z.object({
  cartId: z
    .string({ required_error: "cart id is required" })
    .uuid({ message: "Invalid id" }),
  products: z.array(productWithQuantitySchema).default([]),
});

export type Cart = z.infer<typeof cartSchema>;
