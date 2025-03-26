import { createInsertSchema } from "drizzle-zod";
import { shippingTransactionsTable } from "@schema";
import { z } from "zod";
import { dateTimeSchema, urlSchema } from "@global-entity";

const shippingTransactionStatusEnumSchema = z.enum(
  shippingTransactionsTable.status.enumValues,
);

export const shippingTransactionSchema = createInsertSchema(
  shippingTransactionsTable,
  {
    status: shippingTransactionStatusEnumSchema,
    createdAt: dateTimeSchema("shippingTransaction created at"),
    trackingUrl: urlSchema("tracking url"),
    lastModifiedAt: dateTimeSchema("shippingTransaction updated at"),
  },
);

export const insertShippingTransactionSchema = shippingTransactionSchema.omit({
  id: true,
  createdAt: true,
  lastModifiedAt: true,
});

export type InsertShippingTransaction = z.infer<
  typeof insertShippingTransactionSchema
>;

export type ShippingTransaction = z.infer<typeof shippingTransactionSchema>;

export const ShippingTransactionStatusEnum =
  shippingTransactionStatusEnumSchema.enum;

export type ShippingTransactionStatus = z.infer<
  typeof shippingTransactionStatusEnumSchema
>;
