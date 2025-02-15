import { CheckoutStage } from "./types";
import { CheckoutStageNameEnum } from "@checkout-session-entity";

const reviewStage: CheckoutStage = {
  name: CheckoutStageNameEnum.REVIEW,
  title: "Review",
  showWhenLoggedIn: true,
  isEnabled: false,
};

const shippingStage: CheckoutStage = {
  name: CheckoutStageNameEnum.SHIPPING,
  title: "Shipping",
  next: reviewStage,
  showWhenLoggedIn: true,
  isEnabled: false,
};

const addressStage: CheckoutStage = {
  name: CheckoutStageNameEnum.ADDRESS,
  title: "Address",
  next: shippingStage,
  showWhenLoggedIn: true,
  isEnabled: false,
};

const personalDetails: CheckoutStage = {
  name: CheckoutStageNameEnum.PERSONAL_DETAILS,
  title: "Personal Details",
  showWhenLoggedIn: false,
  next: addressStage,
  isEnabled: false,
};

export const firstStage = personalDetails;
