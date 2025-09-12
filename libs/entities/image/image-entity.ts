import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { imagesTable } from "@schema";
import * as z from "zod";

export const imageSchema = createSelectSchema(imagesTable, {
  productId: z.uuidv4(),
  collectionId: z.uuidv4().optional(),
  url: z.url(),
  alt: z.string().nonempty(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
}).omit({
  collectionId: true,
  productId: true,
});

export const insertImageSchema = createInsertSchema(imagesTable, {
  alt: z.string().nonempty(),
  url: z.url(),
  productId: z.uuidv4(),
  collectionId: z.uuidv4().optional(),
});

export const imageDTOSchema = imageSchema.omit({
  createdAt: true,
  lastModifiedAt: true,
});

export type Image = z.infer<typeof imageSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type ImageDTO = z.infer<typeof imageDTOSchema>;
