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
} from "@context-utils";
import { CheckoutStageEnum } from "@checkout-session-entity";

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { encryptedShippingMethod, shippingMethod } =
    await handleShippingMethodPost(body);
  enableNextCheckoutStage(CheckoutStageEnum.SHIPPING);
  const response = protectedSuccessResponse.OK("Shipping method selected", {
    shippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });

  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.SHIPPING_METHOD, encryptedShippingMethod),
  );
  return response;
};

const GET: PagesFunction = async () => {
  const { shippingMethods, selectedShippingMethod } =
    await getShippingMethods();
  return protectedSuccessResponse.OK("Shipping methods", {
    shippingMethods,
    selectedShippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });
};

export const onRequest = requestHandler({ POST, GET });
