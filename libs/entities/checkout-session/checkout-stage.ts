export const CheckoutStageEnum = {
  ADDRESS: "address",
  SHIPPING: "shipping",
  REVIEW: "review",
  PERSONAL_DETAILS: "personal-details",
} as const;

export type CheckoutStageEnumType =
  (typeof CheckoutStageEnum)[keyof typeof CheckoutStageEnum];
