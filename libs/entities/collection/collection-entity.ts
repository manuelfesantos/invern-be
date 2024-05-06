import { z } from "zod";
import { productSchema } from "@product-entity";
import { requiredStringSchema, uuidSchema } from "@global-entity";
import { imageSchema } from "@image-entity";

export const collectionSchema = z.object({
  collectionId: uuidSchema("collection id"),
  collectionName: requiredStringSchema("collection name"),
  collectionImage: imageSchema,
  description: requiredStringSchema("collection description").optional(),
});

export type Collection = z.infer<typeof collectionSchema>;

export const collectionDetailsSchema = collectionSchema
  .extend({
    products: z.array(productSchema).default([]),
  })
  .omit({ collectionImage: true });

export type CollectionDetails = z.infer<typeof collectionDetailsSchema>;
