import { createSelectSchema } from "drizzle-zod";
import { collectionsTable } from "@schema";
import { z } from "zod";
import { extendedProductSchema, productSchema } from "@product-entity";
import { imageSchema } from "@image-entity";
import { requiredStringSchema, uuidSchema } from "@global-entity";

const baseCollectionSchema = createSelectSchema(collectionsTable, {
  id: uuidSchema("collection id"),
  name: requiredStringSchema("collection name"),
  description: requiredStringSchema("collection description"),
});
export const insertCollectionSchema = baseCollectionSchema.omit({
  id: true,
});

export const collectionDetailsSchema = baseCollectionSchema.merge(
  z.object({
    products: z.array(productSchema),
  }),
);

export const extendedCollectionDetailsSchema = collectionDetailsSchema.extend({
  products: extendedProductSchema.array(),
});

export const collectionSchema = baseCollectionSchema
  .omit({ description: true })
  .merge(
    z.object({
      image: imageSchema.nullable(),
    }),
  );

export type CollectionDetails = z.infer<typeof collectionDetailsSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type ExtendedCollectionDetails = z.infer<
  typeof extendedCollectionDetailsSchema
>;
