import type { ShippingTransactionStatus } from "@shipping-transaction-entity";
import { errors } from "@error-handling-utils";

/**
 * Allowed fulfillment status transitions. `delivered` and `canceled` are
 * terminal. Same-status is a no-op (handled by the caller) and not listed here.
 */
const TRANSITIONS: Record<
  ShippingTransactionStatus,
  ShippingTransactionStatus[]
> = {
  processing: ["shipped", "canceled"],
  shipped: ["delivered", "canceled"],
  delivered: [],
  canceled: [],
};

export const assertValidTransition = (
  from: ShippingTransactionStatus,
  to: ShippingTransactionStatus,
): void => {
  if (from === to) {
    return;
  }
  if (!TRANSITIONS[from].includes(to)) {
    throw errors.INVALID_FULFILLMENT_TRANSITION(from, to);
  }
};
