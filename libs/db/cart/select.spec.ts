import { getCartById } from "./select";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      cartsTable: {
        findFirst: jest.fn().mockReturnValue({
          cartId: "1",
          productsToCarts: [
            {
              product: {
                productId: "productId",
                images: [],
                productName: "productName",
                stock: 1,
                priceInCents: 1,
              },
              quantity: 1,
            },
          ],
        }),
      },
    },
  }),
}));

describe("getCartById", () => {
  const dbSpy = jest.spyOn(DB, "db");
  beforeEach(() => {
    dbSpy.mockClear();
  });
  it("should get a cart", async () => {
    const cartId = "1";
    const cart = await getCartById(cartId);
    expect(cart).toEqual({
      cartId: "1",
      products: [
        {
          productId: "productId",
          images: [],
          quantity: 1,
          productName: "productName",
          stock: 1,
          priceInCents: 1,
        },
      ],
    });
    expect(dbSpy).toHaveBeenCalled();
  });
});
