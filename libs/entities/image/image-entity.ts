import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { imagesTable } from "@schema";
import { z } from "zod";
import { requiredStringSchema, urlSchema, uuidSchema } from "@global-entity";

export const imageSchema = createSelectSchema(imagesTable, {
  productId: uuidSchema("product id"),
  collectionId: z.optional(uuidSchema("collection id")),
  url: urlSchema("image url"),
  alt: requiredStringSchema("image alt"),
}).omit({
  collectionId: true,
  productId: true,
});

export const insertImageSchema = createInsertSchema(imagesTable, {
  alt: requiredStringSchema("image alt"),
  url: urlSchema("image url"),
  productId: uuidSchema("product id"),
  collectionId: z.optional(uuidSchema("collection id")),
});

export type Image = z.infer<typeof imageSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;
