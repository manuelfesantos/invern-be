import { getAllProducts } from "./get-all-products";
import { compareResponses } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as ProductAdapter from "@product-db";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@product-db", () => ({
  getProducts: jest.fn(),
}));

describe("getAllProducts", () => {
  const getProductsSpy = jest.spyOn(ProductAdapter, "getProducts");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get all products", async () => {
    getProductsSpy.mockResolvedValueOnce([]);
    const response = await getAllProducts(null);
    const expectedResponse = successResponse.OK(
      "success getting all products",
      [],
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
});
