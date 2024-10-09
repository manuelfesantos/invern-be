import {
  compareErrorResponses,
  compareResponses,
  loggedInConfigMock,
  loggedOutconfigMock,
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
import * as HttpUtils from "@http-utils";
import * as ConfigModule from "@config-module";
import * as Cookie from "cookie";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

const userVersion = 2;

jest.mock("@jwt-utils", () => ({}));
jest.mock("@config-module", () => ({
  getConfig: jest.fn(),
  configPayloadSchema: {
    parse: jest.fn(),
  },
}));

jest.mock("@http-utils", () => ({
  getFrontendHost: jest.fn(),
  getBodyFromRequest: jest.fn(),
  frontendHost: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("cookie", () => ({
  parse: jest.fn(),
}));

describe("onRequest", () => {
  const getConfigSpy = jest.spyOn(ConfigModule, "getConfig");
  const parseSchemaSpy = jest.spyOn(ConfigModule.configPayloadSchema, "parse");
  const getBodyFromRequestSpy = jest.spyOn(HttpUtils, "getBodyFromRequest");
  const parseCookieSpy = jest.spyOn(Cookie, "parse");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return logged out config with no countries if countries is provided", async () => {
    parseSchemaSpy.mockReturnValueOnce({
      country: "country",
    });
    getConfigSpy.mockResolvedValueOnce(
      successResponse.OK("success getting config", loggedOutconfigMock),
    );
    parseCookieSpy.mockReturnValueOnce({});
    const response = await onRequest(POSTEventMock);
    const expectedResponse = successResponse.OK(
      "success getting config",
      loggedOutconfigMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getConfigSpy).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });
  it("should return logged out config with countries if countries is not provided", async () => {
    const event = {
      ...POSTEventMock,
      request: {
        ...POSTEventMock.request,
        cf: {
          ...POSTEventMock.request.cf,
          country: "PT" as Iso3166Alpha2Code,
        },
      },
    };

    parseSchemaSpy.mockReturnValueOnce({});
    getConfigSpy.mockResolvedValueOnce(
      successResponse.OK("success getting config", loggedOutconfigMock),
    );
    parseCookieSpy.mockReturnValueOnce({});
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting config",
      loggedOutconfigMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getConfigSpy).toHaveBeenCalledWith(
      undefined,
      "PT",
      undefined,
      undefined,
      undefined,
    );
  });

  it("should return error if body is invalid", async () => {
    getBodyFromRequestSpy.mockRejectedValueOnce(
      new Error("invalid JSON payload"),
    );
    const response = await onRequest(POSTEventMock);
    const expectedResponse = errorResponse.BAD_REQUEST(
      prepareError("invalid JSON payload"),
    );
    expect(getConfigSpy).not.toHaveBeenCalled();
    await compareErrorResponses(response, expectedResponse);
  });

  it("should return logged in config if userVersion is provided and refreshToken is valid", async () => {
    parseSchemaSpy.mockReturnValueOnce({
      userVersion,
      country: "country",
    });
    parseCookieSpy.mockReturnValueOnce({ s_r: "refreshToken" });
    getConfigSpy.mockResolvedValueOnce(
      successResponse.OK("success getting config", loggedInConfigMock),
    );
    const response = await onRequest(POSTEventMock);
    const expectedResponse = successResponse.OK(
      "success getting config",
      loggedInConfigMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getConfigSpy).toHaveBeenCalledWith(
      "refreshToken",
      undefined,
      userVersion,
      undefined,
      undefined,
    );
  });
  it.each(["GET", "PUT", "DELETE"])(
    "should return error if method is %s",
    async (method) => {
      const event = {
        ...POSTEventMock,
        request: {
          ...POSTEventMock.request,
          method,
        },
      };
      const response = await onRequest(event);
      const expectedResponse = errorResponse.METHOD_NOT_ALLOWED();
      await compareErrorResponses(response, expectedResponse);
    },
  );
  it("should call getConfig with remember if remember is provided", async () => {
    parseSchemaSpy.mockReturnValueOnce({
      userVersion,
      country: "country",
      remember: true,
    });
    parseCookieSpy.mockReturnValueOnce({ s_r: "refreshToken" });
    getConfigSpy.mockResolvedValueOnce(
      successResponse.OK("success getting config", loggedInConfigMock),
    );
    const response = await onRequest(POSTEventMock);
    const expectedResponse = successResponse.OK(
      "success getting config",
      loggedInConfigMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getConfigSpy).toHaveBeenCalledWith(
      "refreshToken",
      undefined,
      userVersion,
      true,
      undefined,
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
    "should return error with custom code if getConfig throws error",
    async (error, code) => {
      getConfigSpy.mockRejectedValueOnce(error);
      const body = {
        email: "email",
        password: "password",
      };
      getBodyFromRequestSpy.mockResolvedValueOnce(body);
      parseCookieSpy.mockReturnValueOnce({});
      parseSchemaSpy.mockReturnValueOnce({ country: "country" });
      const response = await onRequest(POSTEventMock);
      const expectedResponse = errorResponse[code](
        error instanceof ZodError
          ? simplifyZodError(error)
          : simplifyError(error),
      );
      await compareErrorResponses(response, expectedResponse);
      expect(getConfigSpy).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(getBodyFromRequestSpy).toHaveBeenCalled();
      expect(parseSchemaSpy).toHaveBeenCalledWith(body);
      expect(parseCookieSpy).toHaveBeenCalled();
    },
  );
});
