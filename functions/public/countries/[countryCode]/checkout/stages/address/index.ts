import { protectedSuccessResponse } from "@response-entity";
import {
  getBodyFromRequest,
  getCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { getAddress, handleAddressPost } from "@address-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { CookieNameEnum } from "@http-entity";
import {
  contextStore,
  enableNextCheckoutStage,
  getClientCheckoutStages,
  isCheckoutStageEnabled,
} from "@context-utils";
import { CheckoutStageEnum } from "@checkout-session-entity";
import { errors } from "@error-handling-utils";

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);

  if (!isCheckoutStageEnabled(CheckoutStageEnum.ADDRESS)) {
    throw errors.NOT_ALLOWED("Address checkout stage is not enabled");
  }

  const { address, encryptedAddress } = await handleAddressPost(body);
  enableNextCheckoutStage(CheckoutStageEnum.ADDRESS);

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
};

const GET: PagesFunction = async () => {
  if (!isCheckoutStageEnabled(CheckoutStageEnum.ADDRESS)) {
    throw errors.NOT_ALLOWED("Address checkout stage is not enabled");
  }
  const address = await getAddress();
  return protectedSuccessResponse.OK("Successfully got address", {
    ...(address && { address }),
    availableCheckoutStages: getClientCheckoutStages(),
  });
};

export const onRequest = requestHandler({ POST, GET });
