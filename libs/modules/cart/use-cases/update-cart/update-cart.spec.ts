import { updateCart } from "@cart-module";
import { compareResponses } from "@mocks-utils";
import { errorResponse, successResponse } from "@response-entity";
import * as AddProduct from "./add-product-to-cart";
import * as RemoveProduct from "./remove-product-from-cart";
import * as MergeCart from "./merge-cart-items";
import * as CartAdapter from "@cart-adapter";
import { errors } from "@error-handling-utils";

jest.mock("@cart-adapter", () => ({
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
    addToCartSpy.mockResolvedValue(successResponse.OK("product added to cart"));
    const expectedResponse = successResponse.OK("product added to cart");
    const response = await updateCart({}, "add", "cartId");
    await compareResponses(response, expectedResponse);
    expect(addToCartSpy).toHaveBeenCalledWith({}, "cartId");
  });
  it("should remove from cart if action is remove", async () => {
    removeFromCartSpy.mockResolvedValue(
      successResponse.OK("product removed from cart"),
    );
    const expectedResponse = successResponse.OK("product removed from cart");
    const response = await updateCart({}, "remove", "cartId");
    await compareResponses(response, expectedResponse);
    expect(removeFromCartSpy).toHaveBeenCalledWith({}, "cartId");
  });
  it("should merge cart if action is merge", async () => {
    mergeCartSpy.mockResolvedValue(successResponse.OK("cart merged"));
    const expectedResponse = successResponse.OK("cart merged");
    const response = await updateCart({}, "merge", "cartId");
    await compareResponses(response, expectedResponse);
    expect(mergeCartSpy).toHaveBeenCalledWith({}, "cartId");
  });
  it("should throw error if action is invalid", async () => {
    const response = await updateCart({}, "invalid", "cartId");
    const expectedResponse = errorResponse.BAD_REQUEST(["Invalid action"]);
    await compareResponses(response, expectedResponse);
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should throw error if cart id is invalid", async () => {
    validateCartIdSpy.mockRejectedValue(errors.CART_NOT_FOUND());
    const response = await updateCart({}, "add", "invalid");
    const expectedResponse = errorResponse.NOT_FOUND("Cart not found");
    await compareResponses(response, expectedResponse);
    expect(addToCartSpy).not.toHaveBeenCalled();
    expect(removeFromCartSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
});
