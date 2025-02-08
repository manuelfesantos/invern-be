import { z } from "zod";
import { shippingMethodsTable } from "@schema";
import { createSelectSchema } from "drizzle-zod";
import { requiredStringSchema, uuidSchema } from "@global-entity";
import { shippingRateSchema } from "./rate";

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

export const shippingMethodSchema = baseShippingMethodSchema.extend({
  rates: shippingRateSchema.array(),
});

export const selectedShippingMethodSchema = baseShippingMethodSchema.extend({
  rate: shippingRateSchema,
});

export type InsertShippingMethod = z.infer<typeof insertShippingMethodSchema>;
export type BaseShippingMethod = z.infer<typeof baseShippingMethodSchema>;
export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type SelectedShippingMethod = z.infer<
  typeof selectedShippingMethodSchema
>;
