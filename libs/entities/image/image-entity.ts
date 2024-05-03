import { z } from "zod";
import { requiredStringSchema, urlSchema } from "@global-entity";

export const imageSchema = z.object({
  imageUrl: urlSchema("image url"),
  imageAlt: requiredStringSchema("image alt").optional(),
});
export type ImageUrl = z.infer<typeof imageSchema>;
