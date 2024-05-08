import { mergeCart } from "./merge-cart";
import * as DbAdapter from "@db-utils";
import { prepareStatementMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;
const FIRST_INDEX = 0;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("mergeCart", () => {
  const prepareStatementSpy = jest.spyOn(DbAdapter, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should merge cart", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      run: jest.fn(),
    });
    const cartId = "cartId";
    const items = [
      {
        productId: "productId",
        quantity: 1,
      },
    ];
    await mergeCart(cartId, items);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `INSERT INTO productsCarts (cartId, productId, quantity) VALUES ('${cartId}', '${items[FIRST_INDEX].productId}', ${items[FIRST_INDEX].quantity})`,
    );
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(mergeCart("cartId", [])).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if run throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      run: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(mergeCart("cartId", [])).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
