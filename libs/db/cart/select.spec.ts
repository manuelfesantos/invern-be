import { getCartById } from "./select";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      cartsTable: {
        findFirst: jest.fn().mockReturnValue({
          id: "1",
          productsToCarts: [
            {
              product: {
                id: "productId",
                images: [],
                name: "productName",
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
      id: "1",
      products: [
        {
          id: "productId",
          images: [],
          quantity: 1,
          name: "productName",
          stock: 1,
          priceInCents: 1,
        },
      ],
    });
    expect(dbSpy).toHaveBeenCalled();
  });
});
