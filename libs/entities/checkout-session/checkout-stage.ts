import { CookieName, CookieNameEnum } from "@http-entity";

export const CheckoutStageNameEnum = {
  ADDRESS: "address",
  SHIPPING: "shipping",
  REVIEW: "review",
  PERSONAL_DETAILS: "personal-details",
} as const;

export type CheckoutStageName =
  (typeof CheckoutStageNameEnum)[keyof typeof CheckoutStageNameEnum];

export const checkoutStageToCookie: Partial<
  Record<CheckoutStageName, CookieName>
> = {
  [CheckoutStageNameEnum.ADDRESS]: CookieNameEnum.ADDRESS,
  [CheckoutStageNameEnum.PERSONAL_DETAILS]: CookieNameEnum.USER_DETAILS,
  [CheckoutStageNameEnum.SHIPPING]: CookieNameEnum.SHIPPING_METHOD,
};
