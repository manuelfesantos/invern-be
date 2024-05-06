import { mergeCartItems } from "./merge-cart-items";
import { successResponse } from "@response-entity";
import * as CartAdapter from "@cart-adapter";
import * as ProductAdapter from "@product-adapter";
import { Cart } from "@cart-entity";
import { compareResponses } from "@mocks-utils";

jest.mock("@cart-adapter", () => ({
  mergeCart: jest.fn(),
  getCartById: jest.fn(),
}));

jest.mock("@product-adapter", () => ({
  validateProductIds: jest.fn(),
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
  const validateProductIdsSpy = jest.spyOn(
    ProductAdapter,
    "validateProductIds",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should merge cart items", async () => {
    getCartByIdSpy.mockResolvedValueOnce(emptyCartMock);
    const response = await mergeCartItems(validBody, "cartId");
    const expectedResponse = successResponse.OK("cart merged");
    await compareResponses(response, expectedResponse);
    expect(getCartByIdSpy).toHaveBeenCalledWith("cartId");
    expect(validateProductIdsSpy).toHaveBeenCalledWith(
      validBody.products.map((product) => product.productId),
    );
    expect(mergeCartSpy).toHaveBeenCalledWith("cartId", validBody.products);
  });
  it("should not merge cart items if cart is not empty", async () => {
    getCartByIdSpy.mockResolvedValueOnce(fullCartMock);
    await expect(
      async () => await mergeCartItems(validBody, "cartId"),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Cart is not empty", code: 409 }),
    );
    expect(getCartByIdSpy).toHaveBeenCalledWith("cartId");
    expect(validateProductIdsSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if products is empty", async () => {
    await expect(
      async () => await mergeCartItems({ products: [] }, "cartId"),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Products are required", code: 400 }),
    );
    expect(mergeCartSpy).not.toHaveBeenCalled();
    expect(validateProductIdsSpy).not.toHaveBeenCalled();
    expect(getCartByIdSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if get cart fails", async () => {
    getCartByIdSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(
      async () => await mergeCartItems(validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(validateProductIdsSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if validate product ids fails", async () => {
    validateProductIdsSpy.mockRejectedValueOnce(new Error("validation error"));
    getCartByIdSpy.mockResolvedValueOnce(emptyCartMock);
    await expect(
      async () => await mergeCartItems(validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "validation error" }));
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(validateProductIdsSpy).toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if merge cart fails", async () => {
    mergeCartSpy.mockRejectedValue(new Error("database error"));
    getCartByIdSpy.mockResolvedValue(emptyCartMock);
    await expect(
      async () => await mergeCartItems(validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(validateProductIdsSpy).toHaveBeenCalled();
    expect(mergeCartSpy).toHaveBeenCalled();
  });
});
