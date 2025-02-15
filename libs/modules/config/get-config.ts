import { getLoggedInConfig } from "./logged-in";
import { decodeJwt, verifyRefreshToken } from "@jwt-utils";
import { loggedOutResponse } from "./utils/responses/logged-out-response";
import { z } from "zod";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { simplifyError } from "@response-entity";

export const configPayloadSchema = z.object({
  country: z.string().optional(),
  userVersion: z.number().optional(),
  remember: z.boolean().optional(),
});

export const getConfig = async (
  headers: Headers,
  refreshToken?: string,
  remember?: boolean,
): Promise<Response> => {
  try {
    if (!refreshToken) {
      return await loggedOutResponse(headers);
    } else {
      const tokenIsValid = await verifyRefreshToken(refreshToken);
      const tokenPayload = await decodeJwt(refreshToken);
      if ("userId" in tokenPayload && tokenIsValid) {
        logger().info("getting logged in config", {
          useCase: LoggerUseCaseEnum.GET_CONFIG,
        });
        logger().addRedactedData({ userId: tokenPayload.userId });
        return await getLoggedInConfig(
          headers,
          refreshToken,
          tokenPayload,
          remember,
        );
      } else {
        return await loggedOutResponse(headers);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      logger().error(error.message, {
        useCase: LoggerUseCaseEnum.GET_CONFIG,
        data: {
          error: simplifyError(error),
        },
      });
    }
    return await loggedOutResponse(headers);
  }
};
