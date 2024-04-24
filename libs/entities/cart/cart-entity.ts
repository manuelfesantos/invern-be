import { string, z } from "zod";
import { productSchema } from "@entities/product/product-entity";

export const cartSchema = z.object({
  id: z
    .string({ required_error: "id is required" })
    .uuid({ message: "Invalid id" }),
  products: z.array(productSchema).default([]),
});
