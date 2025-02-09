import { CheckoutStage } from "./types";
import { CheckoutStageEnum } from "@checkout-session-entity";

const reviewStage: CheckoutStage = {
  name: CheckoutStageEnum.REVIEW,
  showWhenLoggedIn: true,
  isEnabled: false,
};

const shippingStage: CheckoutStage = {
  name: CheckoutStageEnum.SHIPPING,
  next: reviewStage,
  showWhenLoggedIn: true,
  isEnabled: false,
};

const addressStage: CheckoutStage = {
  name: CheckoutStageEnum.ADDRESS,
  next: shippingStage,
  showWhenLoggedIn: true,
  isEnabled: false,
};

const personalDetails: CheckoutStage = {
  name: CheckoutStageEnum.PERSONAL_DETAILS,
  showWhenLoggedIn: false,
  next: addressStage,
  isEnabled: false,
};

export const firstStage = personalDetails;
