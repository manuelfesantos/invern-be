import { getProductDetails } from "./get-product-details";
import { successResponse } from "@response-entity";
import { compareResponses, productDetailsMock } from "@mocks-utils";
import * as ProductAdapter from "@product-adapter";
import * as ImageAdapter from "@image-adapter";
import { ZodError } from "zod";

const productId = "c7ca3352-18c0-4468-8e2c-8f30757c1c7c";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@product-adapter", () => ({
  getProductById: jest.fn(),
}));

jest.mock("@image-adapter", () => ({
  getImagesByProductId: jest.fn(),
}));

describe("getProductDetails", () => {
  const getProductByIdSpy = jest.spyOn(ProductAdapter, "getProductById");
  const getImagesByProductIdSpy = jest.spyOn(
    ImageAdapter,
    "getImagesByProductId",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get product details", async () => {
    getProductByIdSpy.mockResolvedValueOnce(productDetailsMock);
    getImagesByProductIdSpy.mockResolvedValueOnce([]);
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
    expect(getImagesByProductIdSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if getProductById throws an error", async () => {
    getProductByIdSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(
      async () => await getProductDetails(productId),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getProductByIdSpy).toHaveBeenCalled();
    expect(getImagesByProductIdSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if getImagesByProductId throws an error", async () => {
    getProductByIdSpy.mockResolvedValueOnce(productDetailsMock);
    getImagesByProductIdSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(
      async () => await getProductDetails(productId),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getProductByIdSpy).toHaveBeenCalled();
    expect(getImagesByProductIdSpy).toHaveBeenCalled();
  });
});
