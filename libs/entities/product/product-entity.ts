import { z } from "zod";
import {
  positiveIntegerSchema,
  positiveNumberSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";
import { imageSchema } from "@image-entity";

export const productSchema = z.object({
  productId: uuidSchema("product id"),
  productName: requiredStringSchema("product name"),
  price: positiveNumberSchema("product price"),
  productImage: imageSchema.nullable(),
});
export const productWithQuantitySchema = productSchema.extend({
  quantity: positiveIntegerSchema("product quantity"),
});
export type Product = z.infer<typeof productSchema>;

export const productIdAndQuantitySchema = z.object({
  productId: uuidSchema("product id"),
  quantity: positiveIntegerSchema("product quantity"),
});

export type ProductIdAndQuantity = z.infer<typeof productIdAndQuantitySchema>;

export const productDetailsSchema = productSchema
  .extend({
    description: requiredStringSchema("product description"),
    collectionName: requiredStringSchema("collection name"),
    productImages: z.array(imageSchema).default([]),
  })
  .omit({ productImage: true });

export type ProductDetails = z.infer<typeof productDetailsSchema>;
