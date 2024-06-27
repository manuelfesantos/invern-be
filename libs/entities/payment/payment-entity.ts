import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { paymentsTable } from "@schema";
import { z } from "zod";

const basePaymentSchema = createSelectSchema(paymentsTable);

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  createdAt: true,
});

export const paymentSchema = basePaymentSchema;

export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
