import { getLoggedInConfig } from "./logged-in";
import * as KvAdapter from "@kv-adapter";
import * as LoggedInResponses from "./utils/responses/logged-in-response";
import * as LoggedOutResponses from "./utils/responses/logged-out-response";
import { successResponse } from "@response-entity";
import { compareResponses } from "@mocks-utils";

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({}));

jest.mock("@kv-adapter", () => ({
  getAuthSecret: jest.fn(() => null),
}));

jest.mock("./utils/responses/logged-out-response", () => ({
  loggedOutResponse: jest.fn(),
}));

jest.mock("./utils/responses/logged-in-response", () => ({
  loggedInResponse: jest.fn(),
}));

const tokenPayload = {
  iat: 1,
  exp: 2,
  userId: "userId",
  cartId: "cartId",
  remember: true,
};

const ONE_TIME = 1;

const validUserVersion = 1;
const invalidUserVersion = undefined;

describe("getLoggedInConfig", () => {
  const getAuthSecretSpy = jest.spyOn(KvAdapter, "getAuthSecret");
  const loggedOutResponseSpy = jest.spyOn(
    LoggedOutResponses,
    "loggedOutResponse",
  );
  const loggedInResponseSpy = jest.spyOn(LoggedInResponses, "loggedInResponse");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return logged in response", async () => {
    getAuthSecretSpy.mockResolvedValueOnce("refreshToken");
    loggedInResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged in response", {
        accessToken: "accessToken",
      }),
    );
    const response = await getLoggedInConfig(
      "refreshToken",
      tokenPayload,
      "country",
      validUserVersion,
    );

    expect(loggedOutResponseSpy).not.toHaveBeenCalled();
    expect(loggedInResponseSpy).toHaveBeenCalledTimes(ONE_TIME);

    const expectedResponse = successResponse.OK("logged in response", {
      accessToken: "accessToken",
    });

    await compareResponses(response, expectedResponse);
  });

  it("should return logged out response if there is no user version", async () => {
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        accessToken: "accessToken",
      }),
    );
    const response = await getLoggedInConfig(
      "refreshToken",
      tokenPayload,
      "country",
      invalidUserVersion,
    );
    expect(loggedInResponseSpy).not.toHaveBeenCalled();
    expect(loggedOutResponseSpy).toHaveBeenCalledTimes(ONE_TIME);
    const expectedResponse = successResponse.OK("logged out response", {
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });

  it("should return logged out response if there is no auth secret for user", async () => {
    getAuthSecretSpy.mockResolvedValueOnce(null);
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        accessToken: "accessToken",
      }),
    );

    const response = await getLoggedInConfig(
      "refreshToken",
      tokenPayload,
      "country",
      validUserVersion,
    );

    expect(loggedInResponseSpy).not.toHaveBeenCalled();
    expect(loggedOutResponseSpy).toHaveBeenCalledTimes(ONE_TIME);
    const expectedResponse = successResponse.OK("logged out response", {
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });
  it("should return logged out response if refresh token is not valid", async () => {
    getAuthSecretSpy.mockResolvedValueOnce("refreshToken");
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        accessToken: "accessToken",
      }),
    );
    const response = await getLoggedInConfig(
      "invalidRefreshToken",
      tokenPayload,
      "country",
      validUserVersion,
    );
    expect(loggedInResponseSpy).not.toHaveBeenCalled();
    expect(loggedOutResponseSpy).toHaveBeenCalledTimes(ONE_TIME);
    const expectedResponse = successResponse.OK("logged out response", {
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });
});
