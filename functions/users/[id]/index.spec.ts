import { onRequest } from "./index";
import * as DbUtils from "@db-utils";
import * as UserModule from "@user-module";
import * as HttpUtils from "@http-utils";
import {
  compareResponses,
  DELETEEventMock,
  GETEventMock,
  POSTEventMock,
  PUTEventMock,
  userMock,
} from "@mocks-utils";
import { errorResponse, successResponse } from "@response-entity";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";
import { HttpMethodEnum } from "@http-entity";

jest.mock("@db-utils", () => ({
  initDb: jest.fn(),
}));

jest.mock("@user-module", () => ({
  getUser: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock("@http-utils", () => ({
  getBodyFromRequest: jest.fn(),
}));

describe("onRequest", () => {
  const getUserSpy = jest.spyOn(UserModule, "getUser");
  const deleteUserSpy = jest.spyOn(UserModule, "deleteUser");
  const updateUserSpy = jest.spyOn(UserModule, "updateUser");
  const initDbSpy = jest.spyOn(DbUtils, "initDb");
  const getBodyFromRequestSpy = jest.spyOn(HttpUtils, "getBodyFromRequest");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return error if request method is not allowed", async () => {
    const event = {
      ...POSTEventMock,
    };
    const response = await onRequest(event);
    const expectedResponse = errorResponse.METHOD_NOT_ALLOWED();
    await compareResponses(response, expectedResponse);
    expect(getUserSpy).not.toHaveBeenCalled();
    expect(deleteUserSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(initDbSpy).toHaveBeenCalled();
    expect(getBodyFromRequestSpy).toHaveBeenCalled();
  });
  it("should call getUser when request method is GET", async () => {
    const event = {
      ...GETEventMock,
      params: {
        id: "userId",
      },
    };
    getUserSpy.mockResolvedValueOnce(
      successResponse.OK("success getting user", userMock),
    );
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting user",
      userMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getUserSpy).toHaveBeenCalled();
    expect(deleteUserSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(initDbSpy).toHaveBeenCalled();
    expect(getBodyFromRequestSpy).toHaveBeenCalledWith(event.request);
  });
  it("should call deleteUser when request method is DELETE", async () => {
    const event = {
      ...DELETEEventMock,
      params: {
        id: "userId",
      },
    };
    deleteUserSpy.mockResolvedValueOnce(
      successResponse.OK("success deleting user"),
    );
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK("success deleting user");
    await compareResponses(response, expectedResponse);
    expect(getUserSpy).not.toHaveBeenCalled();
    expect(deleteUserSpy).toHaveBeenCalledWith("userId");
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(initDbSpy).toHaveBeenCalled();
    expect(getBodyFromRequestSpy).toHaveBeenCalledWith(event.request);
  });
  it("should call updateUser when request method is PUT", async () => {
    const event = {
      ...PUTEventMock,
      request: {
        ...PUTEventMock.request,
        headers: {
          ...PUTEventMock.request.headers,
          get: jest.fn(() => "update-password"),
        },
      },
      params: {
        id: "userId",
      },
    };
    updateUserSpy.mockResolvedValueOnce(
      successResponse.OK("success updating user"),
    );
    const body = { password: "update-password" };
    getBodyFromRequestSpy.mockResolvedValueOnce(body);
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK("success updating user");
    await compareResponses(response, expectedResponse);
    expect(getUserSpy).not.toHaveBeenCalled();
    expect(deleteUserSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).toHaveBeenCalledWith(
      "userId",
      body,
      "update-password",
    );
    expect(initDbSpy).toHaveBeenCalled();
    expect(getBodyFromRequestSpy).toHaveBeenCalledWith(event.request);
  });
  it.each([
    [
      getUserSpy,
      errors.USER_NOT_FOUND(),
      "NOT_FOUND" as const,
      HttpMethodEnum.GET,
    ],
    [
      getUserSpy,
      errors.DATABASE_NOT_INITIALIZED(),
      "INTERNAL_SERVER_ERROR" as const,
      HttpMethodEnum.GET,
    ],
    [
      getUserSpy,
      new Error("error"),
      "INTERNAL_SERVER_ERROR" as const,
      HttpMethodEnum.GET,
    ],
    [
      getUserSpy,
      new ZodError([{ message: "Invalid id", code: "custom", path: ["id"] }]),
      "BAD_REQUEST" as const,
      HttpMethodEnum.GET,
    ],
    [
      deleteUserSpy,
      errors.USER_NOT_FOUND(),
      "NOT_FOUND" as const,
      HttpMethodEnum.DELETE,
    ],
    [
      deleteUserSpy,
      errors.DATABASE_NOT_INITIALIZED(),
      "INTERNAL_SERVER_ERROR" as const,
      HttpMethodEnum.DELETE,
    ],
    [
      deleteUserSpy,
      new Error("error"),
      "INTERNAL_SERVER_ERROR" as const,
      HttpMethodEnum.DELETE,
    ],
    [
      deleteUserSpy,
      new ZodError([{ message: "Invalid id", code: "custom", path: ["id"] }]),
      "BAD_REQUEST" as const,
      HttpMethodEnum.DELETE,
    ],
    [
      updateUserSpy,
      errors.USER_NOT_FOUND(),
      "NOT_FOUND" as const,
      HttpMethodEnum.PUT,
    ],
    [
      updateUserSpy,
      errors.DATABASE_NOT_INITIALIZED(),
      "INTERNAL_SERVER_ERROR" as const,
      HttpMethodEnum.PUT,
    ],
    [
      updateUserSpy,
      new Error("error"),
      "INTERNAL_SERVER_ERROR" as const,
      HttpMethodEnum.PUT,
    ],
    [
      updateUserSpy,
      new ZodError([{ message: "Invalid id", code: "custom", path: ["id"] }]),
      "BAD_REQUEST" as const,
      HttpMethodEnum.PUT,
    ],
  ])(
    "should return custom error when %s throws error",
    async (spy, error, code, method) => {
      const event = {
        ...PUTEventMock,
        params: {
          id: "userId",
        },
        request: {
          ...PUTEventMock.request,
          headers: {
            ...PUTEventMock.request.headers,
            get: jest.fn(() => "update-password"),
          },
          method,
        },
      };
      spy.mockRejectedValueOnce(error);
      const body = { password: "update-password" };
      getBodyFromRequestSpy.mockResolvedValueOnce(body);
      const response = await onRequest(event);
      const expectedResponse = errorResponse[code](
        error instanceof ZodError
          ? error.issues.map((issue) => issue.message)
          : error.message,
      );
      await compareResponses(response, expectedResponse);
      spy === updateUserSpy
        ? expect(spy).toHaveBeenCalledWith("userId", body, "update-password")
        : expect(spy).toHaveBeenCalledWith("userId");
      expect(initDbSpy).toHaveBeenCalled();
      expect(getBodyFromRequestSpy).toHaveBeenCalledWith(event.request);
    },
  );
});
