import { z } from "zod";
import {
  positiveIntegerSchema,
  positiveNumberSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";
import { imageSchema } from "@image-entity";

export const cartItemSchema = z.object({
  productId: uuidSchema("cart item id"),
  quantity: positiveIntegerSchema("cart item quantity"),
  productImage: imageSchema,
  productName: requiredStringSchema("cart item name"),
  price: positiveNumberSchema("cart item price"),
});

export type CartItem = z.infer<typeof cartItemSchema>;
