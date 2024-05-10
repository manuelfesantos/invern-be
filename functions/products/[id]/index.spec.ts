import { onRequest } from "./index";
import * as ProductModule from "@product-module";
import {
  compareResponses,
  GETEventMock,
  productDetailsMock,
} from "@mocks-utils";
import { errorResponse, successResponse } from "@response-entity";
import { HttpMethodEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@db-utils", () => ({
  initDb: jest.fn(),
}));

jest.mock("@product-module", () => ({
  getProductDetails: jest.fn(),
}));

describe("onRequest", () => {
  const getProductDetailsSpy = jest.spyOn(ProductModule, "getProductDetails");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call getProductDetails", async () => {
    const event = {
      ...GETEventMock,
      params: {
        id: "productId",
      },
    };
    getProductDetailsSpy.mockResolvedValueOnce(
      successResponse.OK("success getting product details", productDetailsMock),
    );
    const response = await onRequest(event);
    const expectedResponse = successResponse.OK(
      "success getting product details",
      productDetailsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getProductDetailsSpy).toHaveBeenCalled();
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
      await compareResponses(response, expectedResponse);
      expect(getProductDetailsSpy).not.toHaveBeenCalled();
    },
  );
  it.each([
    [errors.PRODUCT_NOT_FOUND(), "NOT_FOUND" as const],
    [
      new ZodError([{ message: "Invalid id", code: "custom", path: ["id"] }]),
      "BAD_REQUEST" as const,
    ],
    [new Error("error"), "INTERNAL_SERVER_ERROR" as const],
    [errors.DATABASE_NOT_INITIALIZED(), "INTERNAL_SERVER_ERROR" as const],
  ])(
    "should return error with custom code if getProductDetails throws error",
    async (error, code) => {
      const event = {
        ...GETEventMock,
        params: {
          id: "productId",
        },
      };
      getProductDetailsSpy.mockRejectedValueOnce(error);
      const response = await onRequest(event);
      const expectedResponse = errorResponse[code](
        error instanceof ZodError
          ? error.issues.map((issue) => issue.message)
          : error.message,
      );
      await compareResponses(response, expectedResponse);
      expect(getProductDetailsSpy).toHaveBeenCalled();
    },
  );
});
