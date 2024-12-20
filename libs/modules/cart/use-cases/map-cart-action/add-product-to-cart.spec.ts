import { addProductToCart } from "./add-product-to-cart";
import { successResponse } from "@response-entity";
import * as CartAdapter from "@cart-db";
import * as ProductAdapter from "@product-db";
import { compareResponses, productIdAndQuantityMock } from "@mocks-utils";
import { ZodError } from "zod";

const { id, quantity } = productIdAndQuantityMock;

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@cart-db", () => ({
  addToCart: jest.fn(),
}));

jest.mock("@product-db", () => ({
  validateProductIdAndGetStock: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({
  getAnonymousTokens: jest.fn(() => ({
    token: "token",
    refreshToken: "refreshToken",
  })),
  getTokenCookie: jest.fn(),
}));

jest.mock("@kv-adapter", () => ({
  setAuthSecret: jest.fn(),
}));

const tokens = { refreshToken: "refreshToken", accessToken: "token" };

const remember = true;

const validBody = productIdAndQuantityMock;

const bodyWithoutQuantity = {
  ...validBody,
  quantity: undefined,
};

const bodyWithoutProductId = {
  ...validBody,
  id: undefined,
};

const stock = 10;

describe("addProductToCart", () => {
  const addToCartSpy = jest.spyOn(CartAdapter, "addToCart");
  const validateProductIdAndGetStockSpy = jest.spyOn(
    ProductAdapter,
    "validateProductIdAndGetStock",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should add product to cart", async () => {
    validateProductIdAndGetStockSpy.mockResolvedValueOnce(stock);
    const response = await addProductToCart(
      tokens,
      remember,
      validBody,
      "cartId",
    );
    const expectedResponse = successResponse.OK("product added to cart", {
      accessToken: tokens.accessToken,
    });

    await compareResponses(response, expectedResponse);

    expect(addToCartSpy).toHaveBeenCalledWith("cartId", id, quantity, stock);
  });
  it("should not add product to cart if quantity is missing", async () => {
    await expect(
      async () =>
        await addProductToCart(tokens, remember, bodyWithoutQuantity, "cartId"),
    ).rejects.toBeInstanceOf(ZodError);

    expect(validateProductIdAndGetStockSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should not add product to cart if product id is missing", async () => {
    await expect(
      async () =>
        await addProductToCart(
          tokens,
          remember,
          bodyWithoutProductId,
          "cartId",
        ),
    ).rejects.toBeInstanceOf(ZodError);

    expect(validateProductIdAndGetStockSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if validateProductId throws an error", async () => {
    validateProductIdAndGetStockSpy.mockRejectedValueOnce(
      new Error("validation error"),
    );

    await expect(
      async () => await addProductToCart(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "validation error" }));

    expect(validateProductIdAndGetStockSpy).toHaveBeenCalledWith(id, quantity);
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if addToCart throws an error", async () => {
    addToCartSpy.mockRejectedValueOnce(new Error("database error"));
    validateProductIdAndGetStockSpy.mockResolvedValueOnce(stock);

    await expect(
      async () => await addProductToCart(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));

    expect(validateProductIdAndGetStockSpy).toHaveBeenCalled();
    expect(addToCartSpy).toHaveBeenCalledWith("cartId", id, quantity, stock);
  });
});
