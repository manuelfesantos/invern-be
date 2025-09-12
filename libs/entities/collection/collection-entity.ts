import { createSelectSchema } from "drizzle-zod";
import { collectionsTable } from "@schema";
import * as z from "zod";
import { extendedProductSchema, productSchema } from "@product-entity";
import { imageSchema } from "@image-entity";

const baseCollectionSchema = createSelectSchema(collectionsTable, {
  id: z.uuidv4(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  lastModifiedAt: z.iso.datetime({ local: true }),
  createdAt: z.iso.datetime({ local: true }),
});
export const insertCollectionSchema = baseCollectionSchema.omit({
  id: true,
  lastModifiedAt: true,
  createdAt: true,
});

export const collectionDetailsSchema = baseCollectionSchema.extend({
  products: z.array(productSchema),
});

export const extendedCollectionDetailsSchema = collectionDetailsSchema.extend({
  products: extendedProductSchema.array(),
});

export const collectionSchema = baseCollectionSchema
  .omit({ description: true })
  .extend({
    image: imageSchema.nullable(),
  });

export type CollectionDetails = z.infer<typeof collectionDetailsSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type ExtendedCollectionDetails = z.infer<
  typeof extendedCollectionDetailsSchema
>;
