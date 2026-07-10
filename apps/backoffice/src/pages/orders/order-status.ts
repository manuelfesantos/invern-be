import type { components } from "@invern/api-client";

type BadgeVariant = "default" | "success" | "warning" | "danger";
type PaymentState = NonNullable<
  components["schemas"]["ClientPayment"]["state"]
>;
type FulfillmentStatus = NonNullable<
  components["schemas"]["ShippingTransaction"]["status"]
>;

// Payment state → badge variant. Terminal-good is green, in-flight amber,
// failures/cancellations red.
const PAYMENT: Record<PaymentState, BadgeVariant> = {
  succeeded: "success",
  processing: "warning",
  created: "default",
  draft: "default",
  canceled: "danger",
  failed: "danger",
};

// Shipping-transaction status → badge variant.
const FULFILLMENT: Record<FulfillmentStatus, BadgeVariant> = {
  delivered: "success",
  shipped: "default",
  processing: "warning",
  canceled: "danger",
};

export function paymentBadge(state: PaymentState | undefined): {
  variant: BadgeVariant;
  label: string;
} {
  if (!state) return { variant: "default", label: "—" };
  return { variant: PAYMENT[state], label: state.replace(/_/g, " ") };
}

export function fulfillmentBadge(status: FulfillmentStatus | undefined): {
  variant: BadgeVariant;
  label: string;
} {
  if (!status) return { variant: "default", label: "—" };
  return { variant: FULFILLMENT[status], label: status };
}
