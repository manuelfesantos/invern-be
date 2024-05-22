import { updateCart } from "@cart-module";
import { compareResponses } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as AddProduct from "./add-product-to-cart";
import * as RemoveProduct from "./remove-product-from-cart";
import * as MergeCart from "./merge-cart-items";
import * as CartAdapter from "@cart-db";
import { errors } from "@error-handling-utils";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
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

describe("updateCart", () => {
  const addToCartSpy = jest.spyOn(AddProduct, "addProductToCart");
  const removeFromCartSpy = jest.spyOn(RemoveProduct, "removeProductFromCart");
  const mergeCartSpy = jest.spyOn(MergeCart, "mergeCartItems");
  const validateCartIdSpy = jest.spyOn(CartAdapter, "validateCartId");

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should add to cart if action is add", async () => {
    addToCartSpy.mockResolvedValueOnce(
      successResponse.OK("product added to cart"),
    );
    const expectedResponse = successResponse.OK("product added to cart");
    const response = await updateCart({}, "add", "cartId");
    await compareResponses(response, expectedResponse);
    expect(validateCartIdSpy).toHaveBeenCalledWith("cartId");
    expect(addToCartSpy).toHaveBeenCalledWith({}, "cartId");
  });
  it("should remove from cart if action is remove", async () => {
    removeFromCartSpy.mockResolvedValueOnce(
      successResponse.OK("product removed from cart"),
    );
    const expectedResponse = successResponse.OK("product removed from cart");
    const response = await updateCart({}, "remove", "cartId");
    await compareResponses(response, expectedResponse);
    expect(validateCartIdSpy).toHaveBeenCalledWith("cartId");
    expect(removeFromCartSpy).toHaveBeenCalledWith({}, "cartId");
  });
  it("should merge cart if action is merge", async () => {
    mergeCartSpy.mockResolvedValueOnce(successResponse.OK("cart merged"));
    const expectedResponse = successResponse.OK("cart merged");
    const response = await updateCart({}, "merge", "cartId");
    await compareResponses(response, expectedResponse);
    expect(validateCartIdSpy).toHaveBeenCalledWith("cartId");
    expect(mergeCartSpy).toHaveBeenCalledWith({}, "cartId");
  });
  it("should throw error if action is invalid", async () => {
    await expect(
      async () => await updateCart({}, "invalid", "cartId"),
    ).rejects.toBeInstanceOf(ZodError);
    expect(validateCartIdSpy).not.toHaveBeenCalled();
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should throw error if cart id is invalid", async () => {
    validateCartIdSpy.mockRejectedValueOnce(errors.CART_NOT_FOUND());
    await expect(
      async () => await updateCart({}, "add", "invalid"),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Cart not found", code: 404 }),
    );
    expect(validateCartIdSpy).toHaveBeenCalledWith("invalid");
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
});
