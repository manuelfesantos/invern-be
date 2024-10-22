import { z } from "zod";
import { productIdAndQuantitySchema } from "@product-entity";
import { countryEnumSchema } from "@country-entity";

export const checkoutBodySchema = z.object({
  products: z.array(productIdAndQuantitySchema),
  countryCode: countryEnumSchema,
});
