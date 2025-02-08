import { createSelectSchema } from "drizzle-zod";
import { shippingRatesTable } from "@schema";
import { baseShippingMethodSchema } from "./method";
import { positiveIntegerSchema, uuidSchema } from "@global-entity";
import { countryEnumSchema } from "@country-entity";
import { z } from "zod";

export const baseShippingRateSchema = createSelectSchema(shippingRatesTable, {
  shippingMethodId: baseShippingMethodSchema.shape.id,
  id: uuidSchema("shipping rate id"),
  priceInCents: positiveIntegerSchema("price in cents"),
  minWeight: positiveIntegerSchema("min weight"),
  maxWeight: positiveIntegerSchema("max weight"),
  deliveryTime: positiveIntegerSchema("delivery time"),
});

export const shippingRateSchema = baseShippingRateSchema
  .omit({ shippingMethodId: true })
  .extend({
    countryCodes: countryEnumSchema.array(),
  });

export type BaseShippingRate = z.infer<typeof baseShippingRateSchema>;
export type ShippingRate = z.infer<typeof shippingRateSchema>;
