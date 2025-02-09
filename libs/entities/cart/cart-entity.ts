import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { cartsTable } from "@schema";
import { z } from "zod";
import { extendedLineItemSchema, lineItemSchema } from "@product-entity";
import {
  booleanSchema,
  positiveIntegerSchema,
  uuidSchema,
} from "@global-entity";
import { extendedClientTaxSchema } from "@tax-entity";

const baseCartSchema = createSelectSchema(cartsTable, {
  id: uuidSchema("cart id"),
  lastModifiedAt: positiveIntegerSchema("cart last modified date"),
  isLoggedIn: booleanSchema("cart logged in status"),
});

export const insertCartSchema = createInsertSchema(cartsTable).omit({
  id: true,
});

export const cartSchema = baseCartSchema.merge(
  z.object({
    products: z.array(lineItemSchema).optional(),
  }),
);

export const cartDTOSchema = cartSchema.omit({
  id: true,
  lastModifiedAt: true,
  isLoggedIn: true,
});

export const extendedCartSchema = cartDTOSchema.extend({
  products: extendedLineItemSchema.array(),
  grossPrice: positiveIntegerSchema("cart gross price"),
  netPrice: positiveIntegerSchema("cart net price"),
  taxes: extendedClientTaxSchema.array(),
  isCheckoutPossible: booleanSchema("cart checkout possibility"),
});

export const toCartDTO = (cart: Cart): CartDTO => {
  return cartDTOSchema.parse(cart);
};

export type CartDTO = z.infer<typeof cartDTOSchema>;

export type Cart = z.infer<typeof cartSchema>;

export type ExtendedCart = z.infer<typeof extendedCartSchema>;

export type InsertCart = z.infer<typeof insertCartSchema>;

export const EMPTY_CART: Cart = {
  products: [],
  lastModifiedAt: Date.now(),
  id: "",
  isLoggedIn: false,
};
