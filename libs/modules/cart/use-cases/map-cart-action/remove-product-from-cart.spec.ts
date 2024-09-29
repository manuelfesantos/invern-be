import { removeProductFromCart } from "./remove-product-from-cart";
import { successResponse } from "@response-entity";
import { compareResponses, productIdAndQuantityMock } from "@mocks-utils";
import * as CartAdapter from "@cart-db";
import * as ProductAdapter from "@product-db";
import { ZodError } from "zod";

const { productId, quantity } = productIdAndQuantityMock;

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@cart-db", () => ({
  removeFromCart: jest.fn(),
}));

jest.mock("@product-db", () => ({
  validateProductId: jest.fn(),
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
  productId: undefined,
};

describe("removeProductFromCart", () => {
  const removeFromCartSpy = jest.spyOn(CartAdapter, "removeFromCart");
  const validateProductIdSpy = jest.spyOn(ProductAdapter, "validateProductId");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should remove product from cart", async () => {
    const response = await removeProductFromCart(
      tokens,
      remember,
      validBody,
      "cartId",
    );
    const expectedResponse = successResponse.OK("product removed from cart", {
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(validateProductIdSpy).toHaveBeenCalledWith(productId);
    expect(removeFromCartSpy).toHaveBeenCalledWith(
      "cartId",
      productId,
      quantity,
    );
  });
  it("should not remove product from cart if quantity is missing", async () => {
    await expect(
      async () =>
        await removeProductFromCart(
          tokens,
          remember,
          bodyWithoutQuantity,
          "cartId",
        ),
    ).rejects.toBeInstanceOf(ZodError);
    expect(validateProductIdSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
  });
  it("should not remove product from cart if product id is missing", async () => {
    await expect(
      async () =>
        await removeProductFromCart(
          tokens,
          remember,
          bodyWithoutProductId,
          "cartId",
        ),
    ).rejects.toBeInstanceOf(ZodError);
    expect(validateProductIdSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if validateProductId throws an error", async () => {
    validateProductIdSpy.mockRejectedValueOnce(new Error("validation error"));
    await expect(
      async () =>
        await removeProductFromCart(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "validation error" }));
    expect(validateProductIdSpy).toHaveBeenCalledWith(productId);
    expect(removeFromCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if removeFromCart throws an error", async () => {
    removeFromCartSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(
      async () =>
        await removeProductFromCart(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(validateProductIdSpy).toHaveBeenCalledWith(productId);
    expect(removeFromCartSpy).toHaveBeenCalledWith(
      "cartId",
      productId,
      quantity,
    );
  });
});
