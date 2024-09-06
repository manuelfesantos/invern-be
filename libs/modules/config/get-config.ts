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
): Promise<Response> => {
  try {
    if (!refreshToken) {
      return loggedOutResponse(country, userVersion);
    }
    const tokenIsValid = await verifyRefreshToken(refreshToken);
    const tokenPayload = decodeJwt(refreshToken);
    if ("userId" in tokenPayload && tokenIsValid) {
      return getLoggedInConfig(
        refreshToken,
        tokenPayload,
        country,
        userVersion,
        remember,
      );
    }
    return loggedOutResponse(country, userVersion);
  } catch (error) {
    return loggedOutResponse(country, userVersion);
  }
};
