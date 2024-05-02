import { z } from "zod";
import { productSchema } from "@product-entity";

export const collectionSchema = z.object({
  collectionId: z
    .string({ required_error: "collection id is required" })
    .uuid({ message: "Invalid collection id" }),
  collectionName: z.string({ required_error: "collection name is required" }),
});

export type Collection = z.infer<typeof collectionSchema>;

export const collectionDetailsSchema = collectionSchema.extend({
  description: z.string({ required_error: "description is required" }),
  products: z.array(productSchema).default([]),
});

export type CollectionDetails = z.infer<typeof collectionDetailsSchema>;
