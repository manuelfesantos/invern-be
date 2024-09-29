import { mergeCartItems } from "./merge-cart-items";
import { successResponse } from "@response-entity";
import * as CartAdapter from "@cart-db";
import * as ProductAdapter from "@product-db";
import { Cart } from "@cart-entity";
import { compareResponses } from "@mocks-utils";

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@cart-db", () => ({
  mergeCart: jest.fn(),
  getCartById: jest.fn(),
}));

jest.mock("@product-db", () => ({
  validateProductIds: jest.fn(),
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

const emptyCartMock: Cart = {
  cartId: "cartId",
  products: [],
};

const fullCartMock: Cart = {
  cartId: "cartId",
  products: [
    {
      productId: "oT1LPqQ2kaEVjjsZZT11R8",
      quantity: 1,
      images: [
        {
          url: "imageUrl",
          alt: "imageAlt",
        },
      ],
      productName: "productName",
      priceInCents: 100,
      stock: 10,
    },
  ],
};

const validBody = {
  products: [
    {
      productId: "5ry4Xn2dpYJvQhonuNLt1M",
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
    const response = await mergeCartItems(
      tokens,
      remember,
      validBody,
      "cartId",
    );
    const expectedResponse = successResponse.OK("cart merged", {
      accessToken: tokens.accessToken,
    });
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
      async () => await mergeCartItems(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Cart is not empty", code: 409 }),
    );
    expect(getCartByIdSpy).toHaveBeenCalledWith("cartId");
    expect(validateProductIdsSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if products is empty", async () => {
    await expect(
      async () =>
        await mergeCartItems(tokens, remember, { products: [] }, "cartId"),
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
      async () => await mergeCartItems(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(validateProductIdsSpy).not.toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if validate product ids fails", async () => {
    validateProductIdsSpy.mockRejectedValueOnce(new Error("validation error"));
    getCartByIdSpy.mockResolvedValueOnce(emptyCartMock);
    await expect(
      async () => await mergeCartItems(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "validation error" }));
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(validateProductIdsSpy).toHaveBeenCalled();
    expect(mergeCartSpy).not.toHaveBeenCalled();
  });
  it("should not merge cart items if merge cart fails", async () => {
    mergeCartSpy.mockRejectedValue(new Error("database error"));
    getCartByIdSpy.mockResolvedValue(emptyCartMock);
    await expect(
      async () => await mergeCartItems(tokens, remember, validBody, "cartId"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getCartByIdSpy).toHaveBeenCalled();
    expect(validateProductIdsSpy).toHaveBeenCalled();
    expect(mergeCartSpy).toHaveBeenCalled();
  });
});
