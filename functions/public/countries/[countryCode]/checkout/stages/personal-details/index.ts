import {
  getBodyFromRequest,
  getCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import { getUserDetails, handleDetailsPost } from "@user-module";
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
import { getCheckoutStageData } from "../index";

export const onRequestPost = checkoutRequestHandler(async ({ request }) => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.PERSONAL_DETAILS)) {
    throw errors.NOT_ALLOWED("Personal details checkout stage is not enabled");
  }
  const body = await getBodyFromRequest(request);
  const { userDetails, encryptedUserDetails } = await handleDetailsPost(body);
  enableNextCheckoutStage(CheckoutStageNameEnum.PERSONAL_DETAILS);
  const response = protectedSuccessResponse.OK(
    "Successfully created user details",
    {
      ...(await getCheckoutStageData(CheckoutStageNameEnum.ADDRESS)),
      personalDetails: userDetails,
      availableCheckoutStages: getClientCheckoutStages(),
    },
  );
  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.USER_DETAILS, encryptedUserDetails),
  );
  return response;
}, CheckoutStageNameEnum.PERSONAL_DETAILS);

export const onRequestGet = checkoutRequestHandler(async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.PERSONAL_DETAILS)) {
    throw errors.NOT_ALLOWED("Personal details checkout stage is not enabled");
  }
  const userDetails = await getUserDetails();
  return protectedSuccessResponse.OK("Successfully retrieved user details", {
    ...(userDetails && { personalDetails: userDetails }),
    availableCheckoutStages: getClientCheckoutStages(),
  });
}, CheckoutStageNameEnum.PERSONAL_DETAILS);
