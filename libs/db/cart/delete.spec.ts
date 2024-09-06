import { deleteCart } from "./delete";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteCart", () => {
  const dbSpy = jest.spyOn(DB, "db");
  beforeEach(() => {
    dbSpy.mockClear();
  });
  it("should delete a cart", async () => {
    const cartId = "1";
    const result = await deleteCart(cartId);
    expect(result).toBeUndefined();
    expect(dbSpy).toHaveBeenCalled();
  });
});
