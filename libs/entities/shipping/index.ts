import { createSelectSchema } from "drizzle-zod";
import { shippingMethodsTable, shippingRatesTable } from "@schema";
import * as z from "zod";

export const baseShippingMethodSchema = createSelectSchema(
  shippingMethodsTable,
  {
    name: z.string().nonempty(),
    id: z.uuidv4(),
    createdAt: z.iso.datetime({ local: true }),
    lastModifiedAt: z.iso.datetime({ local: true }),
  },
);

export const insertShippingMethodSchema = baseShippingMethodSchema.omit({
  createdAt: true,
  lastModifiedAt: true,
});

export const essentialShippingMethodSchema = insertShippingMethodSchema.omit({
  id: true,
});

export type InsertShippingMethod = z.infer<typeof insertShippingMethodSchema>;
export type BaseShippingMethod = z.infer<typeof baseShippingMethodSchema>;
export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type SelectedShippingMethod = z.infer<
  typeof selectedShippingMethodSchema
>;
export type EssentialShippingMethod = z.infer<
  typeof essentialShippingMethodSchema
>;

export const baseShippingRateSchema = createSelectSchema(shippingRatesTable, {
  shippingMethodId: baseShippingMethodSchema.shape.id,
  id: z.uuidv4(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
  priceInCents: z.int().nonnegative(),
  minWeight: z.int().nonnegative(),
  maxWeight: z.int().nonnegative(),
  deliveryTime: z.int().nonnegative(),
});

export const insertShippingRateSchema = baseShippingRateSchema.omit({
  id: true,
  createdAt: true,
  lastModifiedAt: true,
});

export const shippingRateSchema = baseShippingRateSchema
  .omit({ shippingMethodId: true, id: true })
  .extend({
    countryCodes: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .array(),
  });

export const shippingMethodSchema = baseShippingMethodSchema.extend({
  rates: shippingRateSchema.array(),
});

export const selectedShippingMethodSchema = baseShippingMethodSchema.extend({
  rate: shippingRateSchema,
});

export type BaseShippingRate = z.infer<typeof baseShippingRateSchema>;
export type ShippingRate = z.infer<typeof shippingRateSchema>;
export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;
