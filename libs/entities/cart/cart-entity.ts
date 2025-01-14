import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { cartsTable } from "@schema";
import { z } from "zod";
import { extendedLineItemSchema, lineItemSchema } from "@product-entity";
import { positiveIntegerSchema } from "@global-entity";
import { extendedClientTaxSchema } from "@tax-entity";
import { clientCurrencySchema } from "@currency-entity";

const baseCartSchema = createSelectSchema(cartsTable);

export const insertCartSchema = createInsertSchema(cartsTable).omit({
  id: true,
});

export const cartSchema = baseCartSchema.merge(
  z.object({
    products: z.array(lineItemSchema).optional(),
  }),
);

export const extendedCartSchema = cartSchema
  .omit({
    products: true,
    id: true,
  })
  .merge(
    z.object({
      products: extendedLineItemSchema.array(),
      grossPrice: positiveIntegerSchema("cart gross price"),
      netPrice: positiveIntegerSchema("cart net price"),
      taxes: extendedClientTaxSchema.array(),
      currency: clientCurrencySchema,
    }),
  );

export const toCartDTO = (cart: Cart): CartDTO => {
  return cartDTOSchema.parse(cart);
};

export const cartDTOSchema = cartSchema.omit({
  id: true,
});

export type CartDTO = z.infer<typeof cartDTOSchema>;

export type Cart = z.infer<typeof cartSchema>;

export type ExtendedCart = z.infer<typeof extendedCartSchema>;

export type InsertCart = z.infer<typeof insertCartSchema>;
