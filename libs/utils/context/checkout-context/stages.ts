import { CheckoutStage } from "./types";
import { CheckoutStageEnum } from "@checkout-session-entity";

const reviewStage: CheckoutStage = {
  name: CheckoutStageEnum.REVIEW,
  title: "Review",
  showWhenLoggedIn: true,
  isEnabled: false,
};

const shippingStage: CheckoutStage = {
  name: CheckoutStageEnum.SHIPPING,
  title: "Shipping",
  next: reviewStage,
  showWhenLoggedIn: true,
  isEnabled: false,
};

const addressStage: CheckoutStage = {
  name: CheckoutStageEnum.ADDRESS,
  title: "Address",
  next: shippingStage,
  showWhenLoggedIn: true,
  isEnabled: false,
};

const personalDetails: CheckoutStage = {
  name: CheckoutStageEnum.PERSONAL_DETAILS,
  title: "Personal Details",
  showWhenLoggedIn: false,
  next: addressStage,
  isEnabled: false,
};

export const firstStage = personalDetails;
