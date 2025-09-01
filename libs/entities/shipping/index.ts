import { createSelectSchema } from "drizzle-zod";
import { shippingMethodsTable, shippingRatesTable } from "@schema";
import {
  positiveIntegerSchema,
  requiredStringSchema,
  uuidSchema,
  countryCodeSchema,
  dateTimeSchema,
} from "@global-entity";
import type { z } from "zod";

export const baseShippingMethodSchema = createSelectSchema(
  shippingMethodsTable,
  {
    name: requiredStringSchema("shipping method name"),
    id: uuidSchema("shipping method id"),
    createdAt: dateTimeSchema("shipping method created at date"),
    lastModifiedAt: dateTimeSchema("shipping method last modified at date"),
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
  id: uuidSchema("shipping rate id"),
  createdAt: dateTimeSchema("shipping rate created at date"),
  lastModifiedAt: dateTimeSchema("shipping rate last modified at date"),
  priceInCents: positiveIntegerSchema("price in cents"),
  minWeight: positiveIntegerSchema("min weight"),
  maxWeight: positiveIntegerSchema("max weight"),
  deliveryTime: positiveIntegerSchema("delivery time"),
});

export const insertShippingRateSchema = baseShippingRateSchema.omit({
  id: true,
  createdAt: true,
  lastModifiedAt: true,
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
