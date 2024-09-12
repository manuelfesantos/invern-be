import {
  cartMock,
  compareErrorResponses,
  compareResponses,
  POSTEventMock,
} from "@mocks-utils";
import {
  errorResponse,
  prepareError,
  simplifyError,
  simplifyZodError,
  successResponse,
} from "@response-entity";
import { onRequest } from "./index";
import * as CartModule from "@cart-module";
import * as JwtUtils from "@jwt-utils";
import * as HttpUtils from "@http-utils";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@cart-module", () => ({
  cartActionMapper: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({
  getCredentials: jest.fn(),
}));

jest.mock("@http-utils", () => ({
  getFrontendHost: jest.fn(),
  getBodyFromRequest: jest.fn(),
}));

describe("onRequest", () => {
  const cartActionMapperSpy = jest.spyOn(CartModule, "cartActionMapper");
  const getCredentialsSpy = jest.spyOn(JwtUtils, "getCredentials");
  const getBodyFromRequestSpy = jest.spyOn(HttpUtils, "getBodyFromRequest");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call cartActionMapper without remember", async () => {
    const event = {
      ...POSTEventMock,
      request: {
        ...POSTEventMock.request,
        headers: {
          ...POSTEventMock.request.headers,
          get: jest.fn(() => "add"),
        },
      },
    };
    cartActionMapperSpy.mockResolvedValueOnce(
      successResponse.OK("success getting cart", cartMock),
    );
    getCredentialsSpy.mockResolvedValueOnce({
      userId: "userId",
      cartId: "cartId",
      refreshToken: "refreshToken",
    });
    getBodyFromRequestSpy.mockResolvedValueOnce({});
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting cart",
      cartMock,
    );
    await compareResponses(response, expectedResponse);
    expect(cartActionMapperSpy).toHaveBeenCalledWith(
      { refreshToken: "refreshToken" },
      undefined,
      {},
      "add",
      "cartId",
      "userId",
    );
  });
  it("should call cartActionMapper with remember", async () => {
    const event = {
      ...POSTEventMock,
      request: {
        ...POSTEventMock.request,
        headers: {
          ...POSTEventMock.request.headers,
          get: jest.fn(() => "add"),
        },
      },
    };
    cartActionMapperSpy.mockResolvedValueOnce(
      successResponse.OK("success getting cart", cartMock),
    );
    getCredentialsSpy.mockResolvedValueOnce({
      userId: "userId",
      cartId: "cartId",
      refreshToken: "refreshToken",
      remember: true,
    });
    getBodyFromRequestSpy.mockResolvedValueOnce({});

    const response = await onRequest(event);

    const expectedResponse = successResponse.OK(
      "success getting cart",
      cartMock,
    );
    await compareResponses(response, expectedResponse);

    expect(cartActionMapperSpy).toHaveBeenCalledWith(
      { refreshToken: "refreshToken" },
      true,
      {},
      "add",
      "cartId",
      "userId",
    );
  });
  it.each(["PUT", "DELETE", "GET", "PATCH"])(
    "should return error if method is not allowed",
    async (method) => {
      const event = {
        ...POSTEventMock,
        request: {
          ...POSTEventMock.request,
          method,
          headers: {
            ...POSTEventMock.request.headers,
            get: jest.fn(() => "add"),
          },
        },
      };
      const response = await onRequest(event);
      const expectedResponse = errorResponse.METHOD_NOT_ALLOWED();
      await compareErrorResponses(response, expectedResponse);
    },
  );
  it("should return error if body is not valid", async () => {
    const event = {
      ...POSTEventMock,
      request: {
        ...POSTEventMock.request,
        headers: {
          ...POSTEventMock.request.headers,
          get: jest.fn(() => "add"),
        },
      },
    };
    getBodyFromRequestSpy.mockRejectedValueOnce(new Error("invalid JSON"));
    const response = await onRequest(event);
    const expectedResponse = errorResponse.BAD_REQUEST(
      prepareError("invalid JSON"),
    );
    await compareErrorResponses(response, expectedResponse);
  });
  it("should return error if credentials throw error", async () => {
    const event = {
      ...POSTEventMock,
      request: {
        ...POSTEventMock.request,
        headers: {
          ...POSTEventMock.request.headers,
          get: jest.fn(() => "add"),
        },
      },
    };
    getCredentialsSpy.mockRejectedValueOnce(
      errors.UNAUTHORIZED("invalid credentials"),
    );
    const response = await onRequest(event);
    const expectedResponse = errorResponse.UNAUTHORIZED(
      prepareError("invalid credentials"),
    );
    await compareErrorResponses(response, expectedResponse);
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
    "should return error if cartActionMapper throw error",
    async (error, expectedCode) => {
      const event = {
        ...POSTEventMock,
        request: {
          ...POSTEventMock.request,
          headers: {
            ...POSTEventMock.request.headers,
            get: jest.fn(() => "add"),
          },
        },
      };
      cartActionMapperSpy.mockRejectedValueOnce(error);
      getCredentialsSpy.mockResolvedValueOnce({
        userId: "userId",
        cartId: "cartId",
        refreshToken: "refreshToken",
      });
      getBodyFromRequestSpy.mockResolvedValueOnce({});
      const response = await onRequest(event);
      const expectedResponse = errorResponse[expectedCode](
        error instanceof ZodError
          ? simplifyZodError(error)
          : simplifyError(error),
      );
      await compareErrorResponses(response, expectedResponse);
    },
  );
});
