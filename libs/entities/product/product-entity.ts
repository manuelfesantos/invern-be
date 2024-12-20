import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { productsTable } from "@schema";
import { z } from "zod";
import { imageSchema } from "@image-entity";
import { positiveIntegerSchema, uuidSchema } from "@global-entity";

const baseProductSchema = createSelectSchema(productsTable);
export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
});

export const productDetailsSchema = baseProductSchema.merge(
  z.object({
    images: z.array(imageSchema),
  }),
);

export const productSchema = baseProductSchema
  .omit({ collectionId: true, description: true })
  .merge(
    z.object({
      images: imageSchema.array(),
    }),
  );

export const lineItemSchema = productSchema.merge(
  z.object({
    quantity: positiveIntegerSchema("line item quantity"),
  }),
);

export const productIdAndQuantitySchema = z.object({
  id: uuidSchema("product id"),
  quantity: positiveIntegerSchema("line item quantity"),
});

export const productIdAndQuantityArraySchema = z.array(
  productIdAndQuantitySchema,
);

export type ProductDetails = z.infer<typeof productDetailsSchema>;

export type Product = z.infer<typeof productSchema>;

export type LineItem = z.infer<typeof lineItemSchema>;

export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductIdAndQuantity = z.infer<typeof productIdAndQuantitySchema>;
