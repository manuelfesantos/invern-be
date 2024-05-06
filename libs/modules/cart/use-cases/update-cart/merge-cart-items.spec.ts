import { mergeCartItems } from "./merge-cart-items";
import { errorResponse, successResponse } from "@response-entity";
import * as CartAdapter from "@cart-adapter";
import { Cart } from "@cart-entity";
import { compareResponses } from "@mocks-utils";

jest.mock("@cart-adapter", () => ({
  mergeCart: jest.fn(),
  getCartById: jest.fn(),
}));

const emptyCartMock: Cart = {
  cartId: "cartId",
  products: [],
};

const fullCartMock: Cart = {
  cartId: "cartId",
  products: [
    {
      productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
      quantity: 1,
      productImage: {
        imageUrl: "imageUrl",
        imageAlt: "imageAlt",
      },
      productName: "productName",
      price: 1,
    },
  ],
};

const validBody = {
  products: [
    {
      productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
      quantity: 1,
    },
  ],
};

describe("mergeCartItems", () => {
  const mergeCartSpy = jest.spyOn(CartAdapter, "mergeCart");
  const getCartByIdSpy = jest.spyOn(CartAdapter, "getCartById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should merge cart items", async () => {
    getCartByIdSpy.mockResolvedValue(emptyCartMock);
    const response = await mergeCartItems(validBody, "cartId");
    const expectedResponse = successResponse.OK("cart merged");
    await compareResponses(response, expectedResponse);
    expect(getCartByIdSpy).toHaveBeenCalledWith("cartId");
    expect(mergeCartSpy).toHaveBeenCalledWith("cartId", validBody.products);
  });
  it("should not merge cart items if cart is not empty", async () => {
    getCartByIdSpy.mockResolvedValue(fullCartMock);
    const response = await mergeCartItems(validBody, "cartId");
    const expectedResponse = errorResponse.BAD_REQUEST("cart is not empty");
    await compareResponses(response, expectedResponse);
    expect(getCartByIdSpy).toHaveBeenCalledWith("cartId");
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if products is empty", async () => {
    const response = await mergeCartItems({ products: [] }, "cartId");
    const expectedResponse = errorResponse.BAD_REQUEST("products are required");
    await compareResponses(response, expectedResponse);
    expect(mergeCartSpy).not.toHaveBeenCalled();
    expect(getCartByIdSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if get cart fails", async () => {
    getCartByIdSpy.mockRejectedValue(new Error("database error"));
    const response = await mergeCartItems(validBody, "cartId");
    const expectedResponse =
      errorResponse.INTERNAL_SERVER_ERROR("database error");
    await compareResponses(response, expectedResponse);
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if merge cart fails", async () => {
    mergeCartSpy.mockRejectedValue(new Error("database error"));
    getCartByIdSpy.mockResolvedValue(emptyCartMock);
    const response = await mergeCartItems(validBody, "cartId");
    const expectedResponse =
      errorResponse.INTERNAL_SERVER_ERROR("database error");
    await compareResponses(response, expectedResponse);
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(mergeCartSpy).toHaveBeenCalled();
  });
});
