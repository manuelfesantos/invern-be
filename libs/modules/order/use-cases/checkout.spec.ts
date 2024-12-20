import { checkout } from "@order-module";
import { compareResponses, lineItemsMock, productsMock } from "@mocks-utils";
import { protectedSuccessResponse } from "@response-entity";
import * as StripeAdapter from "@stripe-adapter";
import * as CartDb from "@cart-db";
import * as ProductDb from "@product-db";
import { StripeCheckoutSessionResponse } from "@stripe-entity";
import { errors } from "@error-handling-utils";
import { CountryEnum } from "@country-entity";

jest.mock("@logger-utils", () => ({
  logger: jest
    .fn()
    .mockReturnValue({ addData: jest.fn(), info: jest.fn(), error: jest.fn() }),
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
  decreaseProductsStock: jest.fn(() => productsMock),
}));

jest.mock("@country-db", () => ({
  getCountryByCode: jest.fn(() => ({
    code: "PT",
    taxes: [
      {
        id: "1",
      },
    ],
  })),
}));

jest.mock("@r2-adapter", () => ({
  stockClient: {
    update: jest.fn(),
  },
}));

jest.mock("@checkout-session-db", () => ({
  insertCheckoutSession: jest.fn(() => [
    {
      products: '[{"productId": "4hiuURKg6ajRFTD5YSrd6F", "quantity": 2}]',
      userId: "qsRTdjB1g5nKTa8tb6JGmC",
    },
  ]),
}));

const cartId = "cartId";
const userId = "userId";

const TOO_MUCH_QUANTITY = 3;

const tokens = {
  refreshToken: "refreshToken",
  accessToken: "accessToken",
};

const countryMock = {
  code: "PT",
  taxes: [
    {
      id: "1",
    },
  ],
};
const requestedProducts = lineItemsMock.map((item) => ({
  quantity: item.quantity,
  id: item.id,
}));

const products = lineItemsMock.map((item) => ({
  ...item,
  quantity: undefined,
}));

const invalidRequestedProducts = lineItemsMock.map((item) => ({
  id: item.id,
  quantity: TOO_MUCH_QUANTITY,
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
      countryCode: CountryEnum.PT,
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
      requestedProducts.map((p) => p.id),
    );
    expect(createCheckoutSessionSpy).toHaveBeenCalledWith(
      lineItemsMock,
      countryMock,
    );
  });
  it("should create checkout session from logged in user", async () => {
    getCartByIdSpy.mockResolvedValueOnce({
      id: cartId,
      products: lineItemsMock,
    });
    validateCartIdSpy.mockResolvedValueOnce();
    createCheckoutSessionSpy.mockResolvedValueOnce({
      url: "123",
    } as StripeCheckoutSessionResponse);
    const response = await checkout(tokens, remember, userId, cartId, {
      products: requestedProducts,
      countryCode: CountryEnum.PT,
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
      countryMock,
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
    getCartByIdSpy.mockResolvedValueOnce({ id: cartId, products: [] });
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
          countryCode: CountryEnum.PT,
        }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: `The following product ids are invalid: ${requestedProducts.map((p) => p.id)}`,
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
    getCartByIdSpy.mockResolvedValueOnce({
      id: cartId,
      products: lineItemsMock,
    });
    await expect(
      async () =>
        await checkout(tokens, remember, userId, cartId, {
          products: requestedProducts,
          countryCode: CountryEnum.PT,
        }),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Checkout session creation failed" }),
    );
    expect(createCheckoutSessionSpy).toHaveBeenCalledWith(
      lineItemsMock,
      countryMock,
    );
  });
  it("should throw error if any line item has more quantity than stock", async () => {
    getProductsByProductIdsSpy.mockResolvedValueOnce(products);
    createCheckoutSessionSpy.mockResolvedValueOnce({
      url: "123",
    } as StripeCheckoutSessionResponse);
    await expect(
      async () =>
        await checkout(tokens, remember, undefined, undefined, {
          products: invalidRequestedProducts,
          countryCode: CountryEnum.PT,
        }),
    ).rejects.toEqual(
      errors.PRODUCTS_OUT_OF_STOCK(
        lineItemsMock
          .filter((p) => p.stock < TOO_MUCH_QUANTITY)
          .map((p) => ({ productId: p.id, stock: p.stock })),
      ),
    );
    expect(createCheckoutSessionSpy).not.toHaveBeenCalled();
  });
});
