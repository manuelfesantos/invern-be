import { loggedOutResponse } from "./logged-out-response";
import { successResponse } from "@response-entity";
import { compareResponses } from "@mocks-utils";

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({
  getAnonymousTokens: jest.fn(() => ({
    token: "token",
    refreshToken: "refreshToken",
  })),
  getTokenCookie: jest.fn(() => "tokenCookie"),
}));

describe("loggedOutResponse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return logged out response", async () => {
    const response = await loggedOutResponse();
    const expectedResponse = successResponse.OK(
      "success getting logged out config",
      {
        accessToken: "token",
      },
    );

    await compareResponses(response, expectedResponse);
  });
  it("should return deleteUser if userVersion is provided", async () => {
    const userVersion = 1;
    const response = await loggedOutResponse(undefined, userVersion);
    const expectedResponse = successResponse.OK(
      "success getting logged out config",
      {
        accessToken: "token",
        deleteUser: true,
      },
    );

    await compareResponses(response, expectedResponse);
  });
  it("should return countries if countries is provided", async () => {
    const country = "country";
    const response = await loggedOutResponse(country);
    const expectedResponse = successResponse.OK(
      "success getting logged out config",
      {
        accessToken: "token",
        country,
      },
    );

    await compareResponses(response, expectedResponse);
  });
  it("should return countries and deleteUser if userVersion and countries are provided", async () => {
    const userVersion = 1;
    const country = "country";
    const response = await loggedOutResponse(country, userVersion);
    const expectedResponse = successResponse.OK(
      "success getting logged out config",
      {
        accessToken: "token",
        country,
        deleteUser: true,
      },
    );

    await compareResponses(response, expectedResponse);
  });
});
