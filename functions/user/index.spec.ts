import { onRequest } from "./index";
import * as UserModule from "@user-module";
import * as HttpUtils from "@http-utils";
import {
  compareErrorResponses,
  compareResponses,
  DELETEEventMock,
  GETEventMock,
  POSTEventMock,
  PUTEventMock,
  userMock,
} from "@mocks-utils";
import {
  errorResponse,
  simplifyError,
  simplifyZodError,
  successResponse,
} from "@response-entity";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";
import * as JwtUtils from "@jwt-utils";

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-module", () => ({
  userActionMapper: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock("@http-utils", () => ({
  getBodyFromRequest: jest.fn(),
  getFrontendHost: jest.fn(),
  frontendHost: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({
  getCredentials: jest.fn(),
}));

describe("onRequest", () => {
  const userActionMapperSpy = jest.spyOn(UserModule, "userActionMapper");
  const getUserSpy = jest.spyOn(UserModule, "getUser");
  const updateUserSpy = jest.spyOn(UserModule, "updateUser");
  const deleteUserSpy = jest.spyOn(UserModule, "deleteUser");
  const getBodyFromRequestSpy = jest.spyOn(HttpUtils, "getBodyFromRequest");
  const getCredentialsSpy = jest.spyOn(JwtUtils, "getCredentials");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call userActionMapper", async () => {
    const event = {
      ...POSTEventMock,
      request: {
        ...POSTEventMock.request,
        headers: {
          ...POSTEventMock.request.headers,
          get: jest.fn(() => "login"),
        },
      },
    };
    const body = {
      email: "email",
      password: "password",
      remember: true,
    };
    getBodyFromRequestSpy.mockResolvedValueOnce(body);
    userActionMapperSpy.mockResolvedValueOnce(
      successResponse.OK("success getting user", userMock),
    );
    getCredentialsSpy.mockResolvedValueOnce({
      userId: "userId",
      cartId: "cartId",
      refreshToken: "refreshToken",
    });
    const expectedResponse = successResponse.OK(
      "success getting user",
      userMock,
    );
    const response = await onRequest(event);
    await compareResponses(response, expectedResponse);
    expect(getBodyFromRequestSpy).toHaveBeenCalled();
    expect(userActionMapperSpy).toHaveBeenCalledWith(body, "login", "userId");
  });
  it("should call getUser", async () => {
    const event = {
      ...GETEventMock,
      request: {
        ...GETEventMock.request,
      },
    };
    getCredentialsSpy.mockResolvedValueOnce({
      userId: "userId",
      cartId: "cartId",
      refreshToken: "refreshToken",
    });
    getUserSpy.mockResolvedValueOnce(
      successResponse.OK("success getting user", userMock),
    );
    const expectedResponse = successResponse.OK(
      "success getting user",
      userMock,
    );
    const response = await onRequest(event);
    await compareResponses(response, expectedResponse);
    expect(getUserSpy).toHaveBeenCalledWith(
      { refreshToken: "refreshToken" },
      undefined,
      "userId",
    );
  });
  it("should call updateUser", async () => {
    const event = {
      ...PUTEventMock,
      request: {
        ...PUTEventMock.request,
        headers: {
          ...PUTEventMock.request.headers,
          get: jest.fn(() => "email"),
        },
      },
    };
    getBodyFromRequestSpy.mockResolvedValueOnce(userMock);
    getCredentialsSpy.mockResolvedValueOnce({
      userId: "userId",
      cartId: "cartId",
      refreshToken: "refreshToken",
    });
    updateUserSpy.mockResolvedValueOnce(
      successResponse.OK("success updating user", userMock),
    );
    const expectedResponse = successResponse.OK(
      "success updating user",
      userMock,
    );
    const response = await onRequest(event);
    await compareResponses(response, expectedResponse);
    expect(updateUserSpy).toHaveBeenCalledWith(
      { refreshToken: "refreshToken" },
      undefined,
      userMock,
      "email",
      "userId",
    );
  });
  it("should call deleteUser", async () => {
    const event = {
      ...DELETEEventMock,
      request: {
        ...DELETEEventMock.request,
      },
    };
    getCredentialsSpy.mockResolvedValueOnce({
      userId: "userId",
      cartId: "cartId",
      refreshToken: "refreshToken",
    });
    deleteUserSpy.mockResolvedValueOnce(
      successResponse.OK("success deleting user", userMock),
    );
    const expectedResponse = successResponse.OK(
      "success deleting user",
      userMock,
    );
    const response = await onRequest(event);
    await compareResponses(response, expectedResponse);
    expect(deleteUserSpy).toHaveBeenCalledWith(
      { refreshToken: "refreshToken" },
      undefined,
      "userId",
    );
  });
  it.each([
    [errors.DATABASE_NOT_INITIALIZED(), "INTERNAL_SERVER_ERROR" as const],
    [
      new ZodError([
        { message: "Invalid mail", code: "custom", path: ["email"] },
      ]),
      "BAD_REQUEST" as const,
    ],
    [errors.EMAIL_ALREADY_TAKEN(), "CONFLICT" as const],
    [errors.INVALID_CREDENTIALS(), "UNAUTHORIZED" as const],
  ])(
    "should return error with custom code if userActionMapper throws error",
    async (error, expectedCode) => {
      userActionMapperSpy.mockRejectedValueOnce(error);
      const event = {
        ...POSTEventMock,
        request: {
          ...POSTEventMock.request,
          headers: {
            ...POSTEventMock.request.headers,
            get: jest.fn(() => "login"),
          },
        },
      };
      const body = {
        email: "email",
        password: "password",
      };
      getBodyFromRequestSpy.mockResolvedValueOnce(body);
      getCredentialsSpy.mockResolvedValueOnce({
        userId: "userId",
        cartId: "cartId",
        refreshToken: "refreshToken",
      });
      const response = await onRequest(event);
      const expectedResponse = errorResponse[expectedCode](
        error instanceof ZodError
          ? simplifyZodError(error)
          : simplifyError(error),
      );
      await compareErrorResponses(response, expectedResponse);
      expect(userActionMapperSpy).toHaveBeenCalledWith(body, "login", "userId");
      expect(getBodyFromRequestSpy).toHaveBeenCalled();
    },
  );
});
