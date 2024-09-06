import { getCart } from "./get-cart";
import { successResponse } from "@response-entity";
import * as CartAdapter from "@cart-db";
import { compareResponses, productsMock, userMock } from "@mocks-utils";
import { Cart, toCartDTO } from "@cart-entity";

const FIRST_INDEX = 0;

const lineItemsMock = productsMock.map((product) => ({
  ...product,
  quantity: 1,
}));

const requestedProductsMock = lineItemsMock.map(({ productId, quantity }) => ({
  productId,
  quantity,
}));

jest.mock("@cart-db", () => ({
  getCartById: jest.fn(),
}));

jest.mock("@product-db", () => ({
  getProductsByProductIds: jest.fn(() => lineItemsMock),
}));

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
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

describe("getCart", () => {
  const getCartByIdSpy = jest.spyOn(CartAdapter, "getCartById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get cart from cartId", async () => {
    getCartByIdSpy.mockResolvedValue(userMock.cart as Cart);
    const response = await getCart(tokens, remember, {}, "cartId");
    const expectedResponse = successResponse.OK("success getting cart", {
      cart: toCartDTO(userMock.cart as Cart),
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
  });

  it("should get cart from line items", async () => {
    const response = await getCart(tokens, remember, requestedProductsMock);
    const expectedResponse = successResponse.OK("success getting cart", {
      cart: {
        products: lineItemsMock,
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
  });

  it("should throw error if cart not found", async () => {
    getCartByIdSpy.mockResolvedValue(null as unknown as Cart);
    await expect(
      async () =>
        await getCart(
          tokens,
          remember,
          [
            {
              productId: productsMock[FIRST_INDEX].productId,
              quantity: 1,
            },
          ],
          "cartId",
        ),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Cart not found", code: 404 }),
    );
  });
});
