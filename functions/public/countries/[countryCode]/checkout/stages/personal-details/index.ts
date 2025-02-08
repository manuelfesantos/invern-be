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

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { userDetails, encryptedUserDetails } = await handleDetailsPost(body);
  const response = protectedSuccessResponse.OK(
    "Successfully created user details",
    userDetails,
  );
  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.USER_DETAILS, encryptedUserDetails),
  );
  return response;
};

const GET: PagesFunction = async () => {
  const userDetails = await getUserDetails();
  return protectedSuccessResponse.OK("Successfully retrieved user details", {
    ...(userDetails && { personalDetails: userDetails }),
  });
};

export const onRequest = requestHandler({ POST, GET });
