import * as DB from "@db";
import { updateCart } from "./update";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));
describe("updateCart", () => {
  const dbSpy = jest.spyOn(DB, "db");
  beforeEach(() => {
    dbSpy.mockClear();
  });
  it("should update a cart", async () => {
    const cartId = "1";
    const changes = {
      cartId: "2",
    };

    await updateCart(cartId, changes);

    expect(dbSpy).toHaveBeenCalled();
  });
});
