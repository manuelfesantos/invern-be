import { emptyCart } from "@cart-db";

import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("emptyCart", () => {
  const dbSpy = jest.spyOn(DB, "db");
  beforeEach(() => {
    dbSpy.mockClear();
  });
  it("should empty cart", async () => {
    const cartId = "1";
    await emptyCart(cartId);
    expect(dbSpy).toHaveBeenCalled();
  });
});
