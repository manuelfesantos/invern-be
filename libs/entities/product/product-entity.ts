import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { productsTable } from "@schema";
import { z } from "zod";
import { imageSchema } from "@image-entity";
import {
  positiveIntegerSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";
import { extendedClientTaxSchema } from "@tax-entity";

const priceDetailsSchema = z.object({
  netPrice: positiveIntegerSchema("product net price"),
  grossPrice: positiveIntegerSchema("product gross price"),
  taxes: extendedClientTaxSchema.array(),
});

const baseProductSchema = createSelectSchema(productsTable);
export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
});

export const productDetailsSchema = baseProductSchema.merge(
  z.object({
    images: z.array(imageSchema),
  }),
);

export const productWithCollectionDetailsSchema = productDetailsSchema
  .omit({
    collectionId: true,
  })
  .merge(
    z.object({
      collection: z.object({
        name: requiredStringSchema("collection name"),
        id: uuidSchema("collection name"),
      }),
    }),
  );

export const extendedProductWithCollectionDetailsSchema =
  productWithCollectionDetailsSchema
    .omit({
      priceInCents: true,
    })
    .merge(priceDetailsSchema);

export const productSchema = baseProductSchema
  .omit({ collectionId: true, description: true })
  .merge(
    z.object({
      images: imageSchema.array(),
    }),
  );

export const extendedProductSchema = productSchema
  .omit({ priceInCents: true })
  .merge(priceDetailsSchema);

export const extendedProductDetailsSchema = productDetailsSchema
  .omit({ priceInCents: true })
  .merge(priceDetailsSchema);

export const lineItemSchema = productSchema.merge(
  z.object({
    quantity: positiveIntegerSchema("line item quantity"),
  }),
);

export const lineItemErrorEnumSchema = z.enum(["NOT_ENOUGH_STOCK"]);

export const lineItemErrorSchema = z.object({
  message: requiredStringSchema("cart item error"),
  type: lineItemErrorEnumSchema,
});

export const extendedLineItemSchema = lineItemSchema
  .omit({
    priceInCents: true,
  })
  .extend({
    netPrice: positiveIntegerSchema("line item net price"),
    grossPrice: positiveIntegerSchema("line item gross price"),
    taxes: extendedClientTaxSchema.array(),
    errors: z.array(lineItemErrorSchema).optional(),
  });

export const productIdAndQuantitySchema = z.object({
  id: uuidSchema("product id"),
  quantity: positiveIntegerSchema("line item quantity"),
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
export const LineItemErrorEnum = lineItemErrorEnumSchema.Enum;
export type LineItemErrorEnumType = z.infer<typeof lineItemErrorEnumSchema>;
