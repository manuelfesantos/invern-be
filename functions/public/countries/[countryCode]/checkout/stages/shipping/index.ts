import { PagesFunction } from "@cloudflare/workers-types";
import { requestHandler } from "@decorator-utils";
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
} from "@context-utils";
import { CheckoutStageEnum } from "@checkout-session-entity";
import { errors } from "@error-handling-utils";

const POST: PagesFunction = async ({ request }) => {
  if (!isCheckoutStageEnabled(CheckoutStageEnum.SHIPPING)) {
    throw errors.NOT_ALLOWED("Shipping checkout stage is not enabled");
  }

  const body = await getBodyFromRequest(request);
  const { encryptedShippingMethodId, shippingMethod } =
    await handleShippingMethodPost(body);
  enableNextCheckoutStage(CheckoutStageEnum.SHIPPING);
  const response = protectedSuccessResponse.OK("Shipping method selected", {
    shippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });

  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.SHIPPING_METHOD, encryptedShippingMethodId),
  );
  return response;
};

const GET: PagesFunction = async () => {
  if (!isCheckoutStageEnabled(CheckoutStageEnum.SHIPPING)) {
    throw errors.NOT_ALLOWED("Shipping checkout stage is not enabled");
  }
  const { shippingMethods, selectedShippingMethod } =
    await getShippingMethods();
  return protectedSuccessResponse.OK("Shipping methods", {
    shippingMethods,
    selectedShippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });
};

export const onRequest = requestHandler({ POST, GET });
