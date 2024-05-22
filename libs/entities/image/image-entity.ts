import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { imagesTable } from "@schema";
import { z } from "zod";

export const imageSchema = createSelectSchema(imagesTable).omit({
  collectionId: true,
  productId: true,
});

export const insertImageSchema = createInsertSchema(imagesTable);

export type Image = z.infer<typeof imageSchema>;
export type InsertImage = z.infer<typeof insertImageSchema>;
