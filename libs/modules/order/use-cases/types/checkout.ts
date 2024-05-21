import { z } from "zod";
import { productIdAndQuantitySchema } from "@product-entity";

export const checkoutBodySchema = z.object({
  products: z.array(productIdAndQuantitySchema),
});
