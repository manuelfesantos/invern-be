import { getProductDetails } from "./get-product-details";
import { successResponse } from "@response-entity";
import { compareResponses, productDetailsMock } from "@mocks-utils";
import * as ProductAdapter from "@product-db";
import { ZodError } from "zod";

const productId = "x1hXShk9TrEtcHs32kAkoR";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@product-db", () => ({
  getProductById: jest.fn(),
}));

jest.mock("@image-db", () => ({
  getImagesByProductId: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({}));

describe("getProductDetails", () => {
  const getProductByIdSpy = jest.spyOn(ProductAdapter, "getProductById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get product details", async () => {
    getProductByIdSpy.mockResolvedValueOnce(productDetailsMock);
    const response = await getProductDetails(productId);
    const expectedResponse = successResponse.OK(
      "success getting product details",
      productDetailsMock,
    );
    await compareResponses(response, expectedResponse);
  });
  it("should throw an error if productId is invalid", async () => {
    await expect(
      async () => await getProductDetails("invalid"),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getProductByIdSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if getProductById throws an error", async () => {
    getProductByIdSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(
      async () => await getProductDetails(productId),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getProductByIdSpy).toHaveBeenCalled();
  });
  it("should throw an error if the product is not found", async () => {
    getProductByIdSpy.mockResolvedValueOnce(undefined);
    await expect(
      async () => await getProductDetails(productId),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Product not found" }),
    );
    expect(getProductByIdSpy).toHaveBeenCalled();
  });
});
