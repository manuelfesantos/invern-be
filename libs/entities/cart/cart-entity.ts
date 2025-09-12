import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { cartsTable } from "@schema";
import * as z from "zod";
import { extendedLineItemSchema, lineItemSchema } from "@product-entity";
import { extendedClientTaxSchema } from "@tax-entity";

const cartOperationSchema = z.enum(["ADD", "REMOVE", "UPDATE", "UPSERT"]);

const baseCartSchema = createSelectSchema(cartsTable, {
  id: z.uuidv4(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
  isLoggedIn: z.boolean(),
});

export const insertCartSchema = createInsertSchema(cartsTable);

export const cartSchema = baseCartSchema.extend({
  products: z.array(lineItemSchema).optional(),
});

export const filledCartSchema = cartSchema.extend({
  products: lineItemSchema.array(),
});

export const cartDTOSchema = cartSchema.omit({
  id: true,
  lastModifiedAt: true,
  isLoggedIn: true,
  createdAt: true,
});

export const extendedCartSchema = cartDTOSchema.extend({
  products: extendedLineItemSchema.array(),
  grossPrice: z.int().nonnegative(),
  netPrice: z.int().nonnegative(),
  taxes: extendedClientTaxSchema.array(),
  isCheckoutPossible: z.boolean(),
  issues: z.string().array().optional(),
});

export const toCartDTO = (cart: Cart): CartDTO => {
  return cartDTOSchema.parse(cart);
};

export type CartDTO = z.infer<typeof cartDTOSchema>;

export type Cart = z.infer<typeof cartSchema>;

export type FilledCart = z.infer<typeof filledCartSchema>;

export type ExtendedCart = z.infer<typeof extendedCartSchema>;

export type InsertCart = z.infer<typeof insertCartSchema>;

export const CartOperationEnum = cartOperationSchema.enum;

export type CartOperation = z.infer<typeof cartOperationSchema>;

export const EMPTY_CART: Cart = {
  products: [],
  createdAt: new Date().toISOString(),
  lastModifiedAt: new Date().toISOString(),
  id: "",
  isLoggedIn: false,
};
