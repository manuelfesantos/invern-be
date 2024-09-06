import { getQuantityInCart } from "@cart-db";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      productsToCartsTable: {
        findFirst: jest.fn(),
      },
    },
  }),
}));

const VALUE_ZERO = 0;

describe("getQuantityInCart", () => {
  const findFirstSpy = jest.spyOn(
    DB.db().query.productsToCartsTable,
    "findFirst",
  );
  const productId = "1";
  const cartId = "1";

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return quantity in cart", async () => {
    const quantity = 1;

    findFirstSpy.mockResolvedValueOnce({ cartId, productId, quantity });
    const result = await getQuantityInCart(cartId, productId);
    expect(result).toBe(quantity);
  });

  it("should return 0 when product is not in cart", async () => {
    findFirstSpy.mockResolvedValueOnce({
      cartId,
      productId,
      quantity: null as unknown as number,
    });
    const result = await getQuantityInCart(cartId, productId);
    expect(result).toBe(VALUE_ZERO);
  });
});
