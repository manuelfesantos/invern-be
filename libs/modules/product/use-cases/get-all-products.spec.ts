import { getAllProducts } from "./get-all-products";
import { compareResponses, productsMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as ProductAdapter from "@product-db";
import * as Logger from "@logger-utils";

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@product-db", () => ({
  getProducts: jest.fn(),
  getProductsBySearch: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({}));

describe("getAllProducts", () => {
  const getProductsSpy = jest.spyOn(ProductAdapter, "getProducts");
  const getProductsBySearchSpy = jest.spyOn(
    ProductAdapter,
    "getProductsBySearch",
  );
  const loggerSpy = jest.spyOn(Logger, "logger");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get all products", async () => {
    getProductsSpy.mockResolvedValueOnce(productsMock);
    const response = await getAllProducts(null);
    const expectedResponse = successResponse.OK(
      "success getting all products",
      productsMock,
    );
    await compareResponses(response, expectedResponse);
  });
  it("should throw an error if getProducts throws an error", async () => {
    getProductsSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(async () => await getAllProducts(null)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(getProductsSpy).toHaveBeenCalled();
  });
  it("should get products by search", async () => {
    getProductsBySearchSpy.mockResolvedValueOnce(productsMock);
    const response = await getAllProducts("search");
    const expectedResponse = successResponse.OK(
      "success getting all products",
      productsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(loggerSpy).toHaveBeenCalled();
    expect(getProductsBySearchSpy).toHaveBeenCalled();
    expect(getProductsSpy).not.toHaveBeenCalled();
  });
});
