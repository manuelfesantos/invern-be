import { z } from "zod";

export const productSchema = z.object({
  productId: z
    .string({ required_error: "product id is required" })
    .uuid({ message: "Invalid id" }),
  productName: z.string({ required_error: "name is required" }),
  price: z
    .number({ required_error: "price is required" })
    .positive({ message: "Price must be a positive number" }),
  quantity: z
    .number()
    .int({ message: "Quantity must be an integer" })
    .positive({ message: "Quantity must be a positive number" })
    .optional(),
});
export const productWithQuantitySchema = productSchema.extend({
  quantity: z
    .number({ required_error: "quantity is required" })
    .int({ message: "Quantity must be an integer" })
    .positive({ message: "Quantity must be a positive number" }),
});
export type Product = z.infer<typeof productSchema>;

export const productIdAndQuantitySchema = z.object({
  productId: z
    .string({ required_error: "productId is required" })
    .uuid({ message: "Invalid product ID" }),
  quantity: z
    .number({ required_error: "quantity is required" })
    .int({ message: "Quantity must be an integer" })
    .positive({ message: "Quantity must be a positive number" }),
});

export type ProductIdAndQuantity = z.infer<typeof productIdAndQuantitySchema>;

export const productDetailsSchema = productSchema.extend({
  description: z.string({ required_error: "description is required" }),
  collectionName: z.string({ required_error: "collection name is required" }),
});

export type ProductDetails = z.infer<typeof productDetailsSchema>;
