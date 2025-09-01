import { protectedSuccessResponse } from "@response-entity";
import {
  getBodyFromRequest,
  getCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { getAddress, handleAddressPost } from "@address-module";

import { CookieNameEnum } from "@http-entity";
import {
  contextStore,
  enableNextCheckoutStage,
  getClientCheckoutStages,
  isCheckoutStageEnabled,
  checkoutRequestHandler,
} from "@context-utils";
import { CheckoutStageNameEnum } from "@checkout-session-entity";
import { errors } from "@error-handling-utils";

export const onRequestPost = checkoutRequestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);

  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.ADDRESS)) {
    throw errors.NOT_ALLOWED("Address checkout stage is not enabled");
  }

  const { address, encryptedAddress } = await handleAddressPost(body);
  enableNextCheckoutStage(CheckoutStageNameEnum.ADDRESS);

  contextStore.context.address = encryptedAddress;

  const response = protectedSuccessResponse.OK("Successfully created address", {
    address,
    availableCheckoutStages: getClientCheckoutStages(),
  });

  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.ADDRESS, encryptedAddress),
  );

  return response;
}, CheckoutStageNameEnum.ADDRESS);

export const onRequestGet = checkoutRequestHandler(async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.ADDRESS)) {
    throw errors.NOT_ALLOWED("Address checkout stage is not enabled");
  }
  const address = await getAddress();
  return protectedSuccessResponse.OK("Successfully got address", {
    ...(address && { address }),
    availableCheckoutStages: getClientCheckoutStages(),
  });
}, CheckoutStageNameEnum.ADDRESS);
