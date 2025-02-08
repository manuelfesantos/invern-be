export const CheckoutStageEnum = {
  ADDRESS: "address",
  SHIPPING: "shipping",
  REVIEW: "review",
  PERSONAL_DETAILS: "personalDetails",
} as const;

export type CheckoutStageEnumType =
  (typeof CheckoutStageEnum)[keyof typeof CheckoutStageEnum];
