import { onRequest } from "./index";
import * as UserModule from "@user-module";
import * as HttpUtils from "@http-utils";
import { compareResponses, POSTEventMock, userMock } from "@mocks-utils";
import { errorResponse, successResponse } from "@response-entity";
import { HttpMethodEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-module", () => ({
  userActionMapper: jest.fn(),
}));

jest.mock("@http-utils", () => ({
  getBodyFromRequest: jest.fn(),
}));

describe("onRequest", () => {
  const userActionMapperSpy = jest.spyOn(UserModule, "userActionMapper");
  const getBodyFromRequestSpy = jest.spyOn(HttpUtils, "getBodyFromRequest");
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
    };
    getBodyFromRequestSpy.mockResolvedValueOnce(body);
    userActionMapperSpy.mockResolvedValueOnce(
      successResponse.OK("success getting user", userMock),
    );
    const expectedResponse = successResponse.OK(
      "success getting user",
      userMock,
    );
    const response = await onRequest(event);
    await compareResponses(response, expectedResponse);
    expect(getBodyFromRequestSpy).toHaveBeenCalled();
    expect(userActionMapperSpy).toHaveBeenCalledWith(body, "login");
  });
  it.each([HttpMethodEnum.GET, HttpMethodEnum.DELETE, HttpMethodEnum.PUT])(
    "should return METHOD_NOT_ALLOWED when request method is not POST",
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
      await compareResponses(response, expectedResponse);
      expect(userActionMapperSpy).not.toHaveBeenCalled();
      expect(getBodyFromRequestSpy).not.toHaveBeenCalled();
    },
  );
  it.each([
    [errors.DATABASE_NOT_INITIALIZED(), "INTERNAL_SERVER_ERROR" as const],
    [
      new ZodError([
        { message: "Invalid email", code: "custom", path: ["email"] },
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
      const response = await onRequest(event);
      const expectedResponse = errorResponse[expectedCode](
        error instanceof ZodError
          ? error.issues.map((issue) => issue.message)
          : error.message,
      );
      await compareResponses(response, expectedResponse);
      expect(userActionMapperSpy).toHaveBeenCalledWith(body, "login");
      expect(getBodyFromRequestSpy).toHaveBeenCalled();
    },
  );
});
