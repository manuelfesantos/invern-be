import { getLoggedInConfig } from "./logged-in";
import { decodeJwt, verifyRefreshToken } from "@jwt-utils";
import { loggedOutResponse } from "./utils/responses/logged-out-response";
import { z } from "zod";

export const configPayloadSchema = z.object({
  country: z.string().optional(),
  userVersion: z.number().optional(),
  remember: z.boolean().optional(),
});

export const getConfig = async (
  refreshToken?: string,
  country?: string,
  userVersion?: number,
  remember?: boolean,
  deleteCheckoutSessionCookie?: string,
): Promise<Response> => {
  let response: Response;
  try {
    if (!refreshToken) {
      response = await loggedOutResponse(country, userVersion);
    } else {
      const tokenIsValid = await verifyRefreshToken(refreshToken);
      const tokenPayload = decodeJwt(refreshToken);
      if ("userId" in tokenPayload && tokenIsValid) {
        response = await getLoggedInConfig(
          refreshToken,
          tokenPayload,
          country,
          userVersion,
          remember,
        );
      } else {
        response = await loggedOutResponse(country, userVersion);
      }
    }
  } catch (error) {
    response = await loggedOutResponse(country, userVersion);
  }

  if (deleteCheckoutSessionCookie) {
    response.headers.set("Set-Cookie", deleteCheckoutSessionCookie);
  }

  return response;
};
