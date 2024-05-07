import { addToCart } from "./add-to-cart";
import * as DbAdapter from "@db-adapter";
import { prepareStatementMock } from "@mocks-utils";

jest.mock("@db-adapter", () => ({
  prepareStatement: jest.fn(),
}));

const TIMES_STATEMENT_WAS_CALLED = 2;
const ONE_TIME_CALLED = 1;
const QUANTITY = 1;
const PREV_QUANTITY = 2;

describe("addToCart", () => {
  const prepareStatementSpy = jest.spyOn(DbAdapter, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should update product quantity if product already exists in cart", async () => {
    prepareStatementSpy.mockReturnValueOnce({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValueOnce({ quantity: PREV_QUANTITY }),
    });
    await addToCart("cartId", "productId", QUANTITY);
    expect(prepareStatementSpy).toHaveBeenCalledTimes(
      TIMES_STATEMENT_WAS_CALLED,
    );
    expect(prepareStatementSpy.mock.calls).toEqual([
      [
        `SELECT quantity FROM productsCarts WHERE productId = '${"productId"}' AND cartId = '${"cartId"}'`,
      ],
      [
        `UPDATE productsCarts SET quantity = ${QUANTITY + PREV_QUANTITY} WHERE cartId = '${"cartId"}' AND productId = '${"productId"}'`,
      ],
    ]);
  });
  it("should add product to cart if product does not exist in cart", async () => {
    prepareStatementSpy.mockReturnValueOnce({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValueOnce(null),
    });
    await addToCart("cartId", "productId", QUANTITY);
    expect(prepareStatementSpy).toHaveBeenCalledTimes(
      TIMES_STATEMENT_WAS_CALLED,
    );
    expect(prepareStatementSpy.mock.calls).toEqual([
      [
        `SELECT quantity FROM productsCarts WHERE productId = '${"productId"}' AND cartId = '${"cartId"}'`,
      ],
      [
        `INSERT INTO productsCarts (cartId, productId, quantity) VALUES('${"cartId"}', '${"productId"}', ${QUANTITY})`,
      ],
    ]);
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementationOnce(() => {
      throw new Error("database error");
    });
    await expect(addToCart("cartId", "productId", QUANTITY)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
