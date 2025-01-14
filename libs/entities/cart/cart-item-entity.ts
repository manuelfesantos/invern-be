import { z } from "zod";
import {
  positiveIntegerSchema,
  positiveNumberSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";
import { imageSchema } from "@image-entity";
import { extendedClientTaxSchema } from "@tax-entity";
import { clientCurrencySchema } from "@currency-entity";

export const cartItemSchema = z.object({
  productId: uuidSchema("cart item id"),
  quantity: positiveIntegerSchema("cart item quantity"),
  productImage: imageSchema,
  productName: requiredStringSchema("cart item name"),
  price: positiveNumberSchema("cart item price"),
});
export const extendedCartItemSchema = cartItemSchema
  .omit({
    price: true,
  })
  .merge(
    z.object({
      netPrice: positiveIntegerSchema("cart item net price"),
      grossPrice: positiveIntegerSchema("cart item gross price"),
      taxes: extendedClientTaxSchema.array(),
      currency: clientCurrencySchema,
    }),
  );

export type CartItem = z.infer<typeof cartItemSchema>;
export type ExtendedCartItem = z.infer<typeof extendedCartItemSchema>;
