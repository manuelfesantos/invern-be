import { isCheckoutStageEnabled, checkoutRequestHandler } from "@context-utils";
import { CheckoutStageNameEnum } from "@checkout-session-entity";
import { errors } from "@error-handling-utils";
import { getCheckoutReview } from "@order-module";
import { protectedSuccessResponse } from "@response-entity";

export const onRequestGet = checkoutRequestHandler(async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.REVIEW)) {
    throw errors.NOT_ALLOWED("Review checkout stage is not enabled");
  }

  const { shippingMethod, totalPrice, cart, personalDetails, address } =
    await getCheckoutReview();

  return protectedSuccessResponse.OK("Checkout review", {
    shippingMethod,
    totalPrice,
    cart,
    personalDetails,
    address,
  });
}, CheckoutStageNameEnum.REVIEW);
