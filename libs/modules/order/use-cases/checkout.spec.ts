import { checkout } from "@order-module";
import { compareResponses, lineItemsMock } from "@mocks-utils";
import { protectedSuccessResponse } from "@response-entity";
import * as StripeAdapter from "@stripe-adapter";
import * as CartDb from "@cart-db";
import * as ProductDb from "@product-db";
import { StripeCheckoutSessionResponse } from "@stripe-entity";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({
  getTokenCookie: jest.fn(),
}));

jest.mock("@stripe-adapter", () => ({
  createCheckoutSession: jest.fn(),
}));

jest.mock("@cart-db", () => ({
  getCartById: jest.fn(),
  validateCartId: jest.fn(),
}));

jest.mock("@product-db", () => ({
  getProductsByProductIds: jest.fn(),
}));

const cartId = "cartId";
const userId = "userId";

const tokens = {
  refreshToken: "refreshToken",
  accessToken: "accessToken",
};

const requestedProducts = lineItemsMock.map((item) => ({
  quantity: item.quantity,
  productId: item.productId,
}));

const products = lineItemsMock.map((item) => ({
  ...item,
  quantity: undefined,
}));

const remember = true;

describe("checkout", () => {
  const createCheckoutSessionSpy = jest.spyOn(
    StripeAdapter,
    "createCheckoutSession",
  );
  const getCartByIdSpy = jest.spyOn(CartDb, "getCartById");
  const validateCartIdSpy = jest.spyOn(CartDb, "validateCartId");
  const getProductsByProductIdsSpy = jest.spyOn(
    ProductDb,
    "getProductsByProductIds",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should create checkout session from logged out user", async () => {
    getProductsByProductIdsSpy.mockResolvedValueOnce(products);
    createCheckoutSessionSpy.mockResolvedValueOnce({
      url: "123",
    } as StripeCheckoutSessionResponse);
    const response = await checkout(tokens, remember, undefined, undefined, {
      products: requestedProducts,
    });
    const expectedResponse = protectedSuccessResponse.OK(
      tokens,
      "checkout session created",
      {
        url: "123",
      },
    );
    await compareResponses(response, expectedResponse);
    expect(getProductsByProductIdsSpy).toHaveBeenCalledWith(
      requestedProducts.map((p) => p.productId),
    );
    expect(createCheckoutSessionSpy).toHaveBeenCalledWith(
      lineItemsMock,
      undefined,
      undefined,
    );
  });
  it("should create checkout session from logged in user", async () => {
    getCartByIdSpy.mockResolvedValueOnce({ cartId, products: lineItemsMock });
    validateCartIdSpy.mockResolvedValueOnce();
    createCheckoutSessionSpy.mockResolvedValueOnce({
      url: "123",
    } as StripeCheckoutSessionResponse);
    const response = await checkout(tokens, remember, userId, cartId, {
      products: requestedProducts,
    });
    const expectedResponse = protectedSuccessResponse.OK(
      tokens,
      "checkout session created",
      {
        url: "123",
      },
    );
    await compareResponses(response, expectedResponse);
    expect(getCartByIdSpy).toHaveBeenCalledWith(cartId);
    expect(validateCartIdSpy).toHaveBeenCalledWith(cartId);
    expect(createCheckoutSessionSpy).toHaveBeenCalledWith(
      lineItemsMock,
      userId,
      cartId,
    );
  });
  it("should throw error if cart id is invalid", async () => {
    validateCartIdSpy.mockRejectedValueOnce(new Error("cart not valid"));
    await expect(
      async () => await checkout(tokens, remember, userId, cartId),
    ).rejects.toEqual(expect.objectContaining({ message: "cart not valid" }));
    expect(getCartByIdSpy).not.toHaveBeenCalled();
    expect(createCheckoutSessionSpy).not.toHaveBeenCalled();
  });
  it("should throw error if cart is empty", async () => {
    validateCartIdSpy.mockResolvedValueOnce();
    getCartByIdSpy.mockResolvedValueOnce({ cartId, products: [] });
    await expect(
      async () => await checkout(tokens, remember, userId, cartId),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Cart is empty", code: 409 }),
    );
    expect(getCartByIdSpy).toHaveBeenCalledWith(cartId);
    expect(createCheckoutSessionSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user is not logged in and products provided are not in db", async () => {
    getProductsByProductIdsSpy.mockResolvedValueOnce([]);
    await expect(
      async () =>
        await checkout(tokens, remember, undefined, undefined, {
          products: requestedProducts,
        }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: `The following product ids are invalid: ${requestedProducts.map((p) => p.productId)}`,
        code: 400,
      }),
    );
    expect(createCheckoutSessionSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user is not logged in and body is not provided", async () => {
    await expect(async () => await checkout(tokens, remember)).rejects.toEqual(
      expect.objectContaining({ message: "Products are required", code: 400 }),
    );
    expect(createCheckoutSessionSpy).not.toHaveBeenCalled();
  });
  it("should throw error if createCheckoutSession does not return a url", async () => {
    createCheckoutSessionSpy.mockResolvedValueOnce(
      {} as StripeCheckoutSessionResponse,
    );
    validateCartIdSpy.mockResolvedValueOnce();
    getCartByIdSpy.mockResolvedValueOnce({ cartId, products: lineItemsMock });
    await expect(
      async () =>
        await checkout(tokens, remember, userId, cartId, {
          products: requestedProducts,
        }),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Checkout session creation failed" }),
    );
    expect(createCheckoutSessionSpy).toHaveBeenCalledWith(
      lineItemsMock,
      userId,
      cartId,
    );
  });
});
