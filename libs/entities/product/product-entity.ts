import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { productsTable } from "@schema";
import * as z from "zod";
import { imageDTOSchema, imageSchema } from "@image-entity";
import { extendedClientTaxSchema } from "@tax-entity";

const priceDetailsSchema = z.object({
  netPrice: z.int().nonnegative(),
  grossPrice: z.int().nonnegative(),
  taxes: extendedClientTaxSchema.array(),
});

const baseProductSchema = createSelectSchema(productsTable, {
  id: z.uuidv4(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  priceInCents: z.number().nonnegative(),
  collectionId: z.uuidv4(),
  stock: z.int().nonnegative(),
  weight: z.int().nonnegative(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
});
export const insertProductSchema = createInsertSchema(productsTable, {
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  priceInCents: z.number().nonnegative(),
  collectionId: z.uuidv4(),
  stock: z.int().nonnegative(),
  weight: z.int().nonnegative(),
}).omit({
  id: true,
});

export const productDetailsSchema = baseProductSchema.extend({
  images: z.array(imageSchema),
});

export const productWithCollectionDetailsSchema = productDetailsSchema
  .omit({
    collectionId: true,
  })
  .extend({
    collection: z.object({
      name: z.string().nonempty(),
      id: z.uuidv4(),
    }),
  });

export const extendedProductWithCollectionDetailsSchema =
  productWithCollectionDetailsSchema
    .omit({
      priceInCents: true,
    })
    .extend(priceDetailsSchema.shape);

export const productSchema = baseProductSchema
  .omit({ collectionId: true, description: true })
  .extend({
    images: imageDTOSchema.array(),
  });

export const extendedProductSchema = productSchema
  .omit({ priceInCents: true })
  .extend(priceDetailsSchema.shape);

export const extendedProductDetailsSchema = productDetailsSchema
  .omit({ priceInCents: true })
  .extend(priceDetailsSchema.shape);

export const lineItemSchema = productSchema
  .omit({
    createdAt: true,
    lastModifiedAt: true,
  })
  .extend({
    quantity: z.int().nonnegative(),
  });

export const lineItemErrorEnumSchema = z.enum(["NOT_ENOUGH_STOCK"]);

export const lineItemErrorSchema = z.object({
  message: z.string().nonempty(),
  type: lineItemErrorEnumSchema,
});

export const extendedLineItemSchema = lineItemSchema
  .omit({
    priceInCents: true,
  })
  .extend({
    netPrice: z.int().nonnegative(),
    grossPrice: z.int().nonnegative(),
    taxes: extendedClientTaxSchema.array(),
    issues: z.array(lineItemErrorSchema).optional(),
  });

export const productIdAndQuantitySchema = z.object({
  id: z.uuidv4(),
  quantity: z.int().nonnegative(),
});

export const productIdAndQuantityArraySchema = z.array(
  productIdAndQuantitySchema,
);

export type ProductDetails = z.infer<typeof productDetailsSchema>;

export type ExtendedProductDetails = z.infer<
  typeof extendedProductDetailsSchema
>;

export type Product = z.infer<typeof productSchema>;

export type ExtendedProduct = z.infer<typeof extendedProductSchema>;

export type LineItem = z.infer<typeof lineItemSchema>;

export type ExtendedLineItem = z.infer<typeof extendedLineItemSchema>;

export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductIdAndQuantity = z.infer<typeof productIdAndQuantitySchema>;

export type ProductWithCollectionDetails = z.infer<
  typeof productWithCollectionDetailsSchema
>;

export type ExtendedProductWithCollectionDetails = z.infer<
  typeof extendedProductWithCollectionDetailsSchema
>;

export type LineItemError = z.infer<typeof lineItemErrorSchema>;
export const LineItemErrorEnum = lineItemErrorEnumSchema.enum;
export type LineItemErrorEnumType = z.infer<typeof lineItemErrorEnumSchema>;
