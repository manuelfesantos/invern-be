import { onRequest } from "./index";
import * as CartModule from "@cart-module";
import * as HttpUtils from "@http-utils";
import { errorResponse, successResponse } from "@response-entity";
import { userMock, PUTEventMock, compareResponses } from "@mocks-utils";
import { HttpMethodEnum } from "@http-entity";
import { errors } from "@error-handling-utils";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@cart-module", () => ({
  updateCart: jest.fn(),
}));

jest.mock("@timer-utils", () => ({
  setGlobalTimer: jest.fn(),
}));

jest.mock("@http-utils", () => ({
  getBodyFromRequest: jest.fn(),
}));

describe("onRequest", () => {
  const updateCartSpy = jest.spyOn(CartModule, "updateCart");
  const getBodyFromRequestSpy = jest.spyOn(HttpUtils, "getBodyFromRequest");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call updateCart", async () => {
    const event = {
      ...PUTEventMock,
      request: {
        ...PUTEventMock.request,
      },
      params: {
        id: "cartId",
      },
    };
    const body = {
      email: "email",
    };
    event.request.headers.get.mockReturnValueOnce("update-cart");
    getBodyFromRequestSpy.mockResolvedValueOnce(body);
    updateCartSpy.mockResolvedValueOnce(
      successResponse.OK("cart updated", userMock),
    );
    const expectedResponse = successResponse.OK("cart updated", userMock);
    const response = await onRequest(event);
    await compareResponses(response, expectedResponse);
    expect(updateCartSpy).toHaveBeenCalledWith(body, "update-cart", "cartId");
    expect(getBodyFromRequestSpy).toHaveBeenCalled();
  });
  it.each([HttpMethodEnum.POST, HttpMethodEnum.DELETE, HttpMethodEnum.GET])(
    "should return BAD_REQUEST if method is %s",
    async (method) => {
      const event = {
        ...PUTEventMock,
        request: {
          ...PUTEventMock.request,
          method,
        },
      };
      const response = await onRequest(event);
      const expectedResponse = errorResponse.METHOD_NOT_ALLOWED();
      await compareResponses(response, expectedResponse);
      expect(updateCartSpy).not.toHaveBeenCalled();
      expect(getBodyFromRequestSpy).not.toHaveBeenCalled();
    },
  );
  it("should return BAD_REQUEST if there is no action", async () => {
    const response = await onRequest(PUTEventMock);
    const expectedResponse = errorResponse.BAD_REQUEST("action is required");
    await compareResponses(response, expectedResponse);
    expect(updateCartSpy).not.toHaveBeenCalled();
    expect(getBodyFromRequestSpy).not.toHaveBeenCalled();
  });
  it("should return BAD_REQUEST if body parsing error includes JSON", async () => {
    getBodyFromRequestSpy.mockRejectedValueOnce(new Error("JSON error"));
    PUTEventMock.request.headers.get.mockReturnValueOnce("update-cart");
    const response = await onRequest(PUTEventMock);
    const expectedResponse = errorResponse.BAD_REQUEST("JSON error");
    await compareResponses(response, expectedResponse);
  });
  it.each([
    [errors.EMAIL_ALREADY_TAKEN(), "CONFLICT" as const],
    [errors.INVALID_CREDENTIALS(), "UNAUTHORIZED" as const],
    [errors.CART_NOT_FOUND(), "NOT_FOUND" as const],
  ])(
    "should return error with custom code if updateCart throws error",
    async (error, code) => {
      updateCartSpy.mockRejectedValueOnce(error);
      PUTEventMock.request.headers.get.mockReturnValueOnce("update-cart");
      const response = await onRequest(PUTEventMock);
      const expectedResponse = errorResponse[code](error.message);
      await compareResponses(response, expectedResponse);
      expect(updateCartSpy).toHaveBeenCalled();
      expect(getBodyFromRequestSpy).toHaveBeenCalled();
    },
  );
  it("should return INTERNAL_SERVER_ERROR if error is unknown", async () => {
    PUTEventMock.request.headers.get.mockReturnValueOnce("update-cart");
    updateCartSpy.mockRejectedValueOnce(new Error("Unknown error"));
    const response = await onRequest(PUTEventMock);
    const expectedResponse =
      errorResponse.INTERNAL_SERVER_ERROR("Unknown error");
    await compareResponses(response, expectedResponse);
    expect(updateCartSpy).toHaveBeenCalled();
    expect(getBodyFromRequestSpy).toHaveBeenCalled();
  });
});
