import { addProductToCart } from "./add-product-to-cart";
import { successResponse } from "@response-entity";
import * as CartAdapter from "@cart-adapter";
import * as ProductAdapter from "@product-adapter";
import { compareResponses, productIdAndQuantityMock } from "@mocks-utils";
import { ZodError } from "zod";

const { productId, quantity } = productIdAndQuantityMock;

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@cart-adapter", () => ({
  addToCart: jest.fn(),
}));

jest.mock("@product-adapter", () => ({
  validateProductId: jest.fn(),
}));

const validBody = productIdAndQuantityMock;

const bodyWithoutQuantity = {
  ...validBody,
  quantity: undefined,
};

const bodyWithoutProductId = {
  ...validBody,
  productId: undefined,
};

describe("addProductToCart", () => {
  const addToCartSpy = jest.spyOn(CartAdapter, "addToCart");
  const validateProductIdSpy = jest.spyOn(ProductAdapter, "validateProductId");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should add product to cart", async () => {
    const response = await addProductToCart(validBody, "cartId");
    const expectedResponse = successResponse.OK("product added to cart");

    await compareResponses(response, expectedResponse);

    expect(addToCartSpy).toHaveBeenCalledWith("cartId", productId, quantity);
  });
  it("should not add product to cart if quantity is missing", async () => {
    await expect(
      async () => await addProductToCart(bodyWithoutQuantity, "cartId"),
    ).rejects.toBeInstanceOf(ZodError);

    expect(validateProductIdSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should not add product to cart if product id is missing", async () => {
    await expect(
      async () => await addProductToCart(bodyWithoutProductId, "cartId"),
    ).rejects.toBeInstanceOf(ZodError);

    expect(validateProductIdSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if validateProductId throws an error", async () => {
    validateProductIdSpy.mockRejectedValueOnce(new Error("validation error"));

    await expect(
      async () => await addProductToCart(validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "validation error" }));

    expect(validateProductIdSpy).toHaveBeenCalledWith(productId);
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if addToCart throws an error", async () => {
    addToCartSpy.mockRejectedValueOnce(new Error("database error"));

    await expect(
      async () => await addProductToCart(validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));

    expect(validateProductIdSpy).toHaveBeenCalled();
    expect(addToCartSpy).toHaveBeenCalledWith("cartId", productId, quantity);
  });
});
