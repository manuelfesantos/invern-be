import { mergeCart } from "@cart-db";
import * as DB from "@db";
import { productsToCartsTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn(),
    }),
  }),
}));

describe("mergeCart", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(productsToCartsTable), "values");
  it("should merge cart", async () => {
    const cartId = "1";
    const items = [
      { productId: "1", quantity: 1 },
      { productId: "2", quantity: 2 },
    ];
    await mergeCart(cartId, items);
    expect(valuesSpy).toHaveBeenCalledWith([
      { productId: "1", quantity: 1, cartId },
      { productId: "2", quantity: 2, cartId },
    ]);
  });
});
