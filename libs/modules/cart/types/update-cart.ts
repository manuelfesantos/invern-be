import { z } from "zod";
import { productIdAndQuantitySchema } from "@product-entity";

export const cartActionSchema = z.enum(["add", "remove", "merge"], {
  message: "Invalid action",
});

export const mergeCartItemsBodySchema = z.object({
  products: z.array(productIdAndQuantitySchema, {
    required_error: "products is required",
  }),
});
