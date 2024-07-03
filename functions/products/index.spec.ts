import { onRequest } from "./index";
import * as ProductModule from "@product-module";
import * as HttpUtils from "@http-utils";
import {
  compareErrorResponses,
  compareResponses,
  GETEventMock,
  productsMock,
} from "@mocks-utils";
import {
  errorResponse,
  simplifyError,
  simplifyZodError,
  successResponse,
} from "@response-entity";
import { HttpMethodEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@product-module", () => ({
  getAllProducts: jest.fn(),
}));

jest.mock("@http-utils", () => ({
  getQueryFromUrl: jest.fn(),
}));

describe("onRequest", () => {
  const getAllProductsSpy = jest.spyOn(ProductModule, "getAllProducts");
  const getQueryFromUrlSpy = jest.spyOn(HttpUtils, "getQueryFromUrl");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call getAllProducts and return all products when search is null", async () => {
    const event = {
      ...GETEventMock,
      request: {
        ...GETEventMock.request,
        url: "https://localhost:3000/products",
      },
    };
    getAllProductsSpy.mockResolvedValueOnce(
      successResponse.OK("success getting all products", productsMock),
    );
    getQueryFromUrlSpy.mockReturnValueOnce(null);
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting all products",
      productsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getQueryFromUrlSpy).toHaveBeenCalledWith(event.request.url);
    expect(getAllProductsSpy).toHaveBeenCalledWith(null);
  });
  it("should call getAllProducts and return all products when search is not null", async () => {
    const event = {
      ...GETEventMock,
      request: {
        ...GETEventMock.request,
        url: "https://localhost:3000/products?search=product",
      },
    };
    getAllProductsSpy.mockResolvedValueOnce(
      successResponse.OK("success getting all products", productsMock),
    );
    getQueryFromUrlSpy.mockReturnValueOnce(
      new URLSearchParams("search=product"),
    );
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting all products",
      productsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getQueryFromUrlSpy).toHaveBeenCalledWith(event.request.url);
    expect(getAllProductsSpy).toHaveBeenCalledWith("product");
  });
  it.each([HttpMethodEnum.POST, HttpMethodEnum.DELETE, HttpMethodEnum.PUT])(
    "should return METHOD_NOT_ALLOWED if method is %s",
    async (method) => {
      const event = {
        ...GETEventMock,
        request: {
          ...GETEventMock.request,
          method,
        },
      };
      const response = await onRequest(event);
      const expectedResponse = errorResponse.METHOD_NOT_ALLOWED();
      await compareErrorResponses(response, expectedResponse);
      expect(getAllProductsSpy).not.toHaveBeenCalled();
      expect(getQueryFromUrlSpy).not.toHaveBeenCalled();
    },
  );
  it.each([
    [errors.PRODUCT_NOT_FOUND(), "NOT_FOUND" as const],
    [
      new ZodError([
        { message: "Invalid search", code: "custom", path: ["search"] },
      ]),
      "BAD_REQUEST" as const,
    ],
    [new Error("error"), "INTERNAL_SERVER_ERROR" as const],
    [errors.DATABASE_NOT_INITIALIZED(), "INTERNAL_SERVER_ERROR" as const],
  ])(
    "should return error with custom code if getAllProducts throws error",
    async (error, code) => {
      const event = {
        ...GETEventMock,
        request: {
          ...GETEventMock.request,
          url: "https://localhost:3000/products?search=product",
        },
      };
      getAllProductsSpy.mockRejectedValueOnce(error);
      getQueryFromUrlSpy.mockReturnValueOnce(
        new URLSearchParams("search=product"),
      );
      const response = await onRequest(event);
      const expectedResponse = errorResponse[code](
        error instanceof ZodError
          ? simplifyZodError(error)
          : simplifyError(error),
      );
      await compareErrorResponses(response, expectedResponse);
      expect(getAllProductsSpy).toHaveBeenCalledWith("product");
      expect(getQueryFromUrlSpy).toHaveBeenCalledWith(event.request.url);
    },
  );
});
