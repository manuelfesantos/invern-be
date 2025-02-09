import { createSelectSchema } from "drizzle-zod";
import { shippingMethodsTable, shippingRatesTable } from "@schema";
import {
  positiveIntegerSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";
import { countryCodeSchema } from "@global-entity";
import { z } from "zod";

export const baseShippingMethodSchema = createSelectSchema(
  shippingMethodsTable,
  {
    name: requiredStringSchema("shipping method name"),
    id: uuidSchema("shipping method id"),
  },
);

export const insertShippingMethodSchema = baseShippingMethodSchema.omit({
  id: true,
});

export type InsertShippingMethod = z.infer<typeof insertShippingMethodSchema>;
export type BaseShippingMethod = z.infer<typeof baseShippingMethodSchema>;
export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type SelectedShippingMethod = z.infer<
  typeof selectedShippingMethodSchema
>;

export const baseShippingRateSchema = createSelectSchema(shippingRatesTable, {
  shippingMethodId: baseShippingMethodSchema.shape.id,
  id: uuidSchema("shipping rate id"),
  priceInCents: positiveIntegerSchema("price in cents"),
  minWeight: positiveIntegerSchema("min weight"),
  maxWeight: positiveIntegerSchema("max weight"),
  deliveryTime: positiveIntegerSchema("delivery time"),
});

export const insertShippingRateSchema = baseShippingRateSchema.omit({
  id: true,
});

export const shippingRateSchema = baseShippingRateSchema
  .omit({ shippingMethodId: true, id: true })
  .extend({
    countryCodes: countryCodeSchema.array(),
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
