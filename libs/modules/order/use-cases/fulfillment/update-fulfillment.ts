import * as z from "zod";
import type { Order } from "@order-entity";
import { shippingTransactionStatusSchema } from "@shipping-transaction-entity";
import { getSelectOrdersByIdAction } from "@order-db";
import { getUpdateShippingTransactionAction } from "@shipping-transaction-db";
import { errors } from "@error-handling-utils";
import { assertValidTransition } from "./transitions";

/** Tracking URLs are customer-visible — require a well-formed https URL. */
const httpsUrlSchema = z.string().refine((value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}, "trackingUrl must be a valid https URL");

const fulfillmentBodySchema = z
  .object({
    status: shippingTransactionStatusSchema.optional(),
    trackingUrl: httpsUrlSchema.nullable().optional(),
  })
  .refine((body) => body.status !== undefined || body.trackingUrl !== undefined, {
    message: "Provide status and/or trackingUrl",
  });

/**
 * Updates an order's fulfillment — the shipping transaction's `status` (via the
 * transition state machine) and/or `trackingUrl`. Addressed by order id so the
 * backoffice works from the order it's already viewing. Returns the updated
 * order (with the joined shipping transaction).
 */
export const updateFulfillment = async (
  orderId: string,
  body: unknown,
): Promise<Order> => {
  const [order] = await getSelectOrdersByIdAction(orderId).run();
  if (!order) {
    throw errors.ORDER_NOT_FOUND();
  }

  const { status, trackingUrl } = fulfillmentBodySchema.parse(body);
  const { shippingTransaction } = order;

  if (status && status !== shippingTransaction.status) {
    assertValidTransition(shippingTransaction.status, status);
  }

  await getUpdateShippingTransactionAction(shippingTransaction.id, {
    ...(status && { status }),
    ...(trackingUrl !== undefined && { trackingUrl }),
  }).run();

  const [updated] = await getSelectOrdersByIdAction(orderId).run();
  if (!updated) {
    throw errors.ORDER_NOT_FOUND();
  }
  return updated;
};
