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
import * as HttpUtils from "@http-utils";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@jwt-utils");

jest.mock("@cart-module", () => ({
  cartActionMapper: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
  localLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@http-utils", () => ({
  getFrontendHost: jest.fn(),
  getBodyFromRequest: jest.fn(),
  frontendHost: jest.fn(),
}));

describe("onRequest", () => {
  const cartActionMapperSpy = jest.spyOn(CartModule, "cartActionMapper");
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
      successResponse.OK("success getting carts", cartMock),
    );
    getBodyFromRequestSpy.mockResolvedValueOnce({});
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting carts",
      cartMock,
    );
    await compareResponses(response, expectedResponse);
    expect(cartActionMapperSpy).toHaveBeenCalledWith(
      { refreshToken: "refreshToken", accessToken: "" },
      false,
      {},
      "add",
      "cartId",
      "userId",
      {},
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
      successResponse.OK("success getting carts", cartMock),
    );
    getBodyFromRequestSpy.mockResolvedValueOnce({});

    const response = await onRequest(event);

    const expectedResponse = successResponse.OK(
      "success getting carts",
      cartMock,
    );
    await compareResponses(response, expectedResponse);

    expect(cartActionMapperSpy).toHaveBeenCalledWith(
      { refreshToken: "refreshToken", accessToken: "" },
      false,
      {},
      "add",
      "cartId",
      "userId",
      {},
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
    const error = new Error("invalid JSON");
    Object.assign(error, { cause: "UNABLE_TO_PARSE_BODY" });
    getBodyFromRequestSpy.mockRejectedValueOnce(error);
    const response = await onRequest(event);
    const expectedResponse = errorResponse.BAD_REQUEST(
      prepareError("invalid JSON", "UNABLE_TO_PARSE_BODY"),
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
