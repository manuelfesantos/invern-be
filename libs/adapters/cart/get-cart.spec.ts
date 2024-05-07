import { getCartById } from "./get-cart";
import * as DbAdapter from "@db-adapter";
import { prepareStatementMock } from "@mocks-utils";

jest.mock("@db-adapter", () => ({
  prepareStatement: jest.fn(),
}));

const productId = "b333a655-f0bb-43f0-86e1-57bc80325c79";
describe("getCartById", () => {
  const prepareStatementSpy = jest.spyOn(DbAdapter, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should get cart by id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockResolvedValue({
        results: [
          {
            productId,
            productName: "name",
            quantity: 1,
            price: 1,
            imageUrl: "http://url.com",
            imageAlt: "alt",
          },
        ],
      }),
    });
    const cart = await getCartById("cartId");
    expect(cart).toEqual({
      cartId: "cartId",
      products: [
        {
          productId: productId,
          productName: "name",
          price: 1,
          quantity: 1,
          productImage: {
            imageUrl: "http://url.com",
            imageAlt: "alt",
          },
        },
      ],
    });
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT products.*, productsCarts.quantity, url as imageUrl, alt as imageAlt FROM productsCarts
            JOIN products ON productsCarts.productId = products.productId
            JOIN images ON products.productId = images.productId
            WHERE cartId = 'cartId'
            GROUP BY products.productId`,
    );
  });
});
