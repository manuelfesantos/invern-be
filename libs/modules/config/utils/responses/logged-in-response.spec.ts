import { loggedInResponse } from "./logged-in-response";
import { successResponse } from "@response-entity";
import { compareResponses, userMock } from "@mocks-utils";
import * as UserDb from "@user-db";
import * as LoggedOutResponses from "./logged-out-response";
import { User, userToUserDTO } from "@user-entity";

const userId = "userId";
const userVersion = 10;
const refreshToken = "refreshToken";
const country = "country";
const cartId = "cartId";
const remember = true;

const NO_USER_VERSION = 0;
const ONE_VERSION = 1;

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("./logged-out-response", () => ({
  loggedOutResponse: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({
  getLoggedInToken: jest.fn(() => "accessToken"),
  getTokenCookie: jest.fn(() => "tokenCookie"),
}));

jest.mock("@kv-adapter", () => ({}));

jest.mock("@user-db", () => ({
  getUserVersionById: jest.fn(() => userVersion),
  getUserById: jest.fn(),
}));

describe("loggedInResponse", () => {
  const getUserVersionByIdSpy = jest.spyOn(UserDb, "getUserVersionById");
  const loggedOutResponseSpy = jest.spyOn(
    LoggedOutResponses,
    "loggedOutResponse",
  );
  const getUserByIdSpy = jest.spyOn(UserDb, "getUserById");
  it("should return logged in response", async () => {
    const response = await loggedInResponse(
      userId,
      userVersion,
      refreshToken,
      country,
      cartId,
      remember,
    );

    const expectedResponse = successResponse.OK(
      "success getting logged in config",
      {
        country,
        accessToken: "accessToken",
      },
    );

    await compareResponses(response, expectedResponse);
  });

  it("should return logged out response if there is no saved user version", async () => {
    getUserVersionByIdSpy.mockResolvedValueOnce(NO_USER_VERSION);
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        accessToken: "accessToken",
      }),
    );
    const response = await loggedInResponse(
      userId,
      userVersion,
      refreshToken,
      country,
      cartId,
      remember,
    );

    const expectedResponse = successResponse.OK("logged out response", {
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });

  it("should return logged in response with user if saved version is greater than user version", async () => {
    getUserVersionByIdSpy.mockResolvedValueOnce(userVersion + ONE_VERSION);
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const response = await loggedInResponse(
      userId,
      userVersion,
      refreshToken,
      country,
      cartId,
      remember,
    );
    const expectedResponse = successResponse.OK(
      "success getting logged in config",
      {
        country,
        accessToken: "accessToken",
        user: userToUserDTO(userMock),
      },
    );
    await compareResponses(response, expectedResponse);
  });
  it("should return logged out config if there is no user with the provided id", async () => {
    getUserByIdSpy.mockResolvedValueOnce(null as unknown as User);
    getUserVersionByIdSpy.mockResolvedValueOnce(userVersion + ONE_VERSION);
    loggedOutResponseSpy.mockResolvedValueOnce(
      successResponse.OK("logged out response", {
        accessToken: "accessToken",
      }),
    );
    const response = await loggedInResponse(
      userId,
      userVersion,
      refreshToken,
      country,
      cartId,
      remember,
    );
    const expectedResponse = successResponse.OK("logged out response", {
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });
});
