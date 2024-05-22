import { createSelectSchema } from "drizzle-zod";
import { collectionsTable } from "@schema";
import { z } from "zod";
import { productSchema } from "@product-entity";
import { imageSchema } from "@image-entity";

const baseCollectionSchema = createSelectSchema(collectionsTable);
export const insertCollectionSchema = createSelectSchema(collectionsTable).omit(
  {
    collectionId: true,
  },
);

export const collectionDetailsSchema = baseCollectionSchema.merge(
  z.object({
    products: z.array(productSchema),
  }),
);

export const collectionSchema = baseCollectionSchema
  .omit({ description: true })
  .merge(
    z.object({
      images: imageSchema.nullable(),
    }),
  );

export type CollectionDetails = z.infer<typeof collectionDetailsSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
