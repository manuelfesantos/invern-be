import {
  getBodyFromRequest,
  getCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { handleShippingMethodPost, getShippingMethods } from "@shipping-module";
import { protectedSuccessResponse } from "@response-entity";
import { CookieNameEnum } from "@http-entity";
import {
  enableNextCheckoutStage,
  getClientCheckoutStages,
  isCheckoutStageEnabled,
  checkoutRequestHandler,
} from "@context-utils";
import { CheckoutStageNameEnum } from "@checkout-session-entity";
import { errors } from "@error-handling-utils";

export const onRequestPost = checkoutRequestHandler(async ({ request }) => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.SHIPPING)) {
    throw errors.NOT_ALLOWED("Shipping checkout stage is not enabled");
  }

  const body = await getBodyFromRequest(request);
  const { encryptedShippingMethodId, shippingMethod } =
    await handleShippingMethodPost(body);
  enableNextCheckoutStage(CheckoutStageNameEnum.SHIPPING);
  const response = protectedSuccessResponse.OK("Shipping method selected", {
    shippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });

  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.SHIPPING_METHOD, encryptedShippingMethodId),
  );
  return response;
}, CheckoutStageNameEnum.SHIPPING);

export const onRequestGet = checkoutRequestHandler(async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.SHIPPING)) {
    throw errors.NOT_ALLOWED("Shipping checkout stage is not enabled");
  }
  const { shippingMethods, selectedShippingMethod } =
    await getShippingMethods();
  return protectedSuccessResponse.OK("Shipping methods", {
    shippingMethods,
    selectedShippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });
}, CheckoutStageNameEnum.SHIPPING);
