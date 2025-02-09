import { PagesFunction } from "@cloudflare/workers-types";
import { requestHandler } from "@decorator-utils";
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
} from "@context-utils";
import { CheckoutStageEnum } from "@checkout-session-entity";
import { errors } from "@error-handling-utils";

const POST: PagesFunction = async ({ request }) => {
  if (!isCheckoutStageEnabled(CheckoutStageEnum.PERSONAL_DETAILS)) {
    throw errors.NOT_ALLOWED("Personal details checkout stage is not enabled");
  }
  const body = await getBodyFromRequest(request);
  const { userDetails, encryptedUserDetails } = await handleDetailsPost(body);
  enableNextCheckoutStage(CheckoutStageEnum.PERSONAL_DETAILS);
  const response = protectedSuccessResponse.OK(
    "Successfully created user details",
    {
      personalDetails: userDetails,
      availableCheckoutStages: getClientCheckoutStages(),
    },
  );
  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.USER_DETAILS, encryptedUserDetails),
  );
  return response;
};

const GET: PagesFunction = async () => {
  if (!isCheckoutStageEnabled(CheckoutStageEnum.PERSONAL_DETAILS)) {
    throw errors.NOT_ALLOWED("Personal details checkout stage is not enabled");
  }
  const userDetails = await getUserDetails();
  return protectedSuccessResponse.OK("Successfully retrieved user details", {
    ...(userDetails && { personalDetails: userDetails }),
    availableCheckoutStages: getClientCheckoutStages(),
  });
};

export const onRequest = requestHandler({ POST, GET });
