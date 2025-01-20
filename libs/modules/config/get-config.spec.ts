import { compareResponses } from "@mocks-utils";
import { successResponse } from "@response-entity";
import { getConfig } from "./get-config";
import * as LoggedIn from "./logged-in";
import * as LoggedOutResponses from "./utils/responses/logged-out-response";
import * as JwtUtils from "@jwt-utils";

const userVersion = 1;
const ONE_TIME = 1;

const validUserToken = {
  userId: "userId",
  iat: 1,
  exp: 2,
  remember: true,
  cartId: "cartId",
};

const invalidUserToken = {
  iat: 1,
  exp: 2,
  remember: true,
};

jest.mock("@jwt-utils", () => ({
  decodeJwt: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("./logged-in", () => ({
  getLoggedInConfig: jest.fn(() => ({})),
}));

jest.mock("./utils/responses/logged-out-response", () => ({
  loggedOutResponse: jest.fn(() => ({})),
}));

describe("getConfig", () => {
  const getLoggedInConfigSpy = jest.spyOn(LoggedIn, "getLoggedInConfig");
  const loggedOutResponseSpy = jest.spyOn(
    LoggedOutResponses,
    "loggedOutResponse",
  );
  const verifyRefreshTokenSpy = jest.spyOn(JwtUtils, "verifyRefreshToken");
  const decodeJwtSpy = jest.spyOn(JwtUtils, "decodeJwt");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return logged in config if refresh token has a user Id and is valid", async () => {
    getLoggedInConfigSpy.mockResolvedValueOnce(
      successResponse.OK("logged in response", {
        loggedIn: true,
      }),
    );
    decodeJwtSpy.mockResolvedValueOnce(validUserToken);
    verifyRefreshTokenSpy.mockResolvedValueOnce(true);
    const response = await getConfig(
      "refreshToken",
      "country",
      userVersion,
      true,
    );
    const expectedResponse = successResponse.OK("logged in response", {
      loggedIn: true,
    });
    await compareResponses(response, expectedResponse);
    expect(getLoggedInConfigSpy).toHaveBeenCalledTimes(ONE_TIME);
  });
  it("should return logged out response if refresh token is not present", async () => {
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        loggedIn: false,
      }),
    );
    const response = await getConfig(undefined, "country", userVersion, true);
    expect(loggedOutResponseSpy).toHaveBeenCalledTimes(ONE_TIME);
    const expectedResponse = successResponse.OK("logged out response", {
      loggedIn: false,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should return logged out response if an error is thrown", async () => {
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        loggedIn: false,
      }),
    );
    verifyRefreshTokenSpy.mockRejectedValueOnce(new Error());
    const response = await getConfig(
      "refreshToken",
      "country",
      userVersion,
      true,
    );
    expect(loggedOutResponseSpy).toHaveBeenCalledTimes(ONE_TIME);
    const expectedResponse = successResponse.OK("logged out response", {
      loggedIn: false,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should return logged out response if refresh token does not have a user Id", async () => {
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        loggedIn: false,
      }),
    );
    decodeJwtSpy.mockResolvedValueOnce(invalidUserToken);
    verifyRefreshTokenSpy.mockResolvedValueOnce(true);
    const response = await getConfig(
      "refreshToken",
      "country",
      userVersion,
      true,
    );
    expect(loggedOutResponseSpy).toHaveBeenCalledTimes(ONE_TIME);
    const expectedResponse = successResponse.OK("logged out response", {
      loggedIn: false,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should return logged out response if refresh token is not valid", async () => {
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        loggedIn: false,
      }),
    );
    decodeJwtSpy.mockResolvedValueOnce(validUserToken);
    verifyRefreshTokenSpy.mockResolvedValueOnce(false);
    const response = await getConfig(
      "refreshToken",
      "country",
      userVersion,
      true,
    );
    expect(loggedOutResponseSpy).toHaveBeenCalledTimes(ONE_TIME);
    const expectedResponse = successResponse.OK("logged out response", {
      loggedIn: false,
    });
    await compareResponses(response, expectedResponse);
  });
});
