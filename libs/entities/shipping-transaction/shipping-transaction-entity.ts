import { createInsertSchema } from "drizzle-zod";
import { shippingTransactionsTable } from "@schema";
import * as z from "zod";

export const shippingTransactionStatusSchema = z.enum(
  shippingTransactionsTable.status.enumValues,
);
const shippingTransactionStatusEnumSchema = shippingTransactionStatusSchema;

export const shippingTransactionSchema = createInsertSchema(
  shippingTransactionsTable,
  {
    status: shippingTransactionStatusEnumSchema,
    trackingUrl: z.url().nullable(),
    createdAt: z.iso.datetime({ local: true }),
    lastModifiedAt: z.iso.datetime({ local: true }),
  },
);

export const insertShippingTransactionSchema = shippingTransactionSchema.omit({
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
