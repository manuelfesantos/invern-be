import { cartActionMapper } from "@cart-module";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as AddProduct from "./add-product-to-cart";
import * as RemoveProduct from "./remove-product-from-cart";
import * as MergeCart from "./merge-cart-items";
import * as CartAdapter from "@cart-db";
import * as GetCart from "../get-cart";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@cart-db", () => ({
  validateCartId: jest.fn(),
}));

jest.mock("./add-product-to-cart", () => ({
  addProductToCart: jest.fn(),
}));

jest.mock("./remove-product-from-cart", () => ({
  removeProductFromCart: jest.fn(),
}));

jest.mock("./merge-cart-items", () => ({
  mergeCartItems: jest.fn(),
}));

jest.mock("../get-cart", () => ({
  getCart: jest.fn(),
}));

jest.mock("@user-db", () => ({
  getUserById: jest.fn(() => userMock),
  incrementUserVersion: jest.fn(),
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

describe("updateCart", () => {
  const addToCartSpy = jest.spyOn(AddProduct, "addProductToCart");
  const removeFromCartSpy = jest.spyOn(RemoveProduct, "removeProductFromCart");
  const mergeCartSpy = jest.spyOn(MergeCart, "mergeCartItems");
  const getCartSpy = jest.spyOn(GetCart, "getCart");
  const validateCartIdSpy = jest.spyOn(CartAdapter, "validateCartId");

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should add to cart if action is add", async () => {
    addToCartSpy.mockResolvedValueOnce(
      successResponse.OK("product added to cart"),
    );
    const expectedResponse = successResponse.OK("product added to cart");
    const response = await cartActionMapper(
      tokens,
      remember,
      {},
      "add",
      "cartId",
      "userId",
    );
    await compareResponses(response, expectedResponse);
    expect(validateCartIdSpy).toHaveBeenCalledWith("cartId");
    expect(addToCartSpy).toHaveBeenCalledWith(
      tokens,
      remember,
      {},
      "cartId",
      undefined,
    );
  });
  it("should remove from cart if action is remove", async () => {
    removeFromCartSpy.mockResolvedValueOnce(
      successResponse.OK("product removed from cart"),
    );
    const expectedResponse = successResponse.OK("product removed from cart");
    const response = await cartActionMapper(
      tokens,
      remember,
      {},
      "remove",
      "cartId",
      "userId",
    );
    await compareResponses(response, expectedResponse);
    expect(validateCartIdSpy).toHaveBeenCalledWith("cartId");
    expect(removeFromCartSpy).toHaveBeenCalledWith(
      tokens,
      remember,
      {},
      "cartId",
      undefined,
    );
  });
  it("should merge cart if action is merge", async () => {
    mergeCartSpy.mockResolvedValueOnce(successResponse.OK("cart merged"));
    const expectedResponse = successResponse.OK("cart merged");
    const response = await cartActionMapper(
      tokens,
      remember,
      {},
      "merge",
      "cartId",
      "userId",
    );
    await compareResponses(response, expectedResponse);
    expect(validateCartIdSpy).toHaveBeenCalledWith("cartId");
    expect(mergeCartSpy).toHaveBeenCalledWith(
      tokens,
      remember,
      {},
      "cartId",
      undefined,
    );
  });
  it("should get cart if action is get", async () => {
    getCartSpy.mockResolvedValueOnce(
      successResponse.OK("cart", { cart: { cartId: "cartId" } }),
    );
    const response = await cartActionMapper(
      tokens,
      remember,
      {},
      "get",
      "cartId",
      "userId",
    );
    const expectedResponse = successResponse.OK("cart", {
      cart: { cartId: "cartId" },
    });
    await compareResponses(response, expectedResponse);
    expect(getCartSpy).toHaveBeenCalledWith(
      tokens,
      remember,
      {},
      "cartId",
      undefined,
    );
    expect(validateCartIdSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should throw error if action is invalid", async () => {
    await expect(
      async () =>
        await cartActionMapper(tokens, remember, {}, "invalid", "cartId"),
    ).rejects.toBeInstanceOf(ZodError);
    expect(validateCartIdSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should throw error if cart id is invalid", async () => {
    validateCartIdSpy.mockRejectedValueOnce(errors.CART_NOT_FOUND());
    await expect(
      async () =>
        await cartActionMapper(
          tokens,
          remember,
          {},
          "add",
          "invalid",
          "userId",
        ),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Cart not found", code: 404 }),
    );
    expect(validateCartIdSpy).toHaveBeenCalledWith("invalid");
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user is not logged in", async () => {
    await expect(
      async () => await cartActionMapper(tokens, remember, {}, "add", "cartId"),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Unauthorized", code: 401 }),
    );
    expect(validateCartIdSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
  });
});
