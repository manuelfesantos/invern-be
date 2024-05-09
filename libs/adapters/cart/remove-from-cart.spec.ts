import { removeFromCart } from "./remove-from-cart";
import * as DbUtils from "@db-utils";
import * as QuantityInCart from "./get-quantity-in-cart";
import { prepareStatementMock } from "@mocks-utils";

const ONE_ITEM = 1;
const TWO_ITEMS = 2;
const ONE_TIME_CALLED = 1;
jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

jest.mock("./get-quantity-in-cart", () => ({
  getQuantityInCart: jest.fn(),
}));

describe("removeFromCart", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  const getQuantityInCartSpy = jest.spyOn(QuantityInCart, "getQuantityInCart");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should remove product from cart if selected quantity is equal to quantity in cart", async () => {
    getQuantityInCartSpy.mockResolvedValue(ONE_ITEM);
    await removeFromCart("cartId", "productId", ONE_ITEM);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `DELETE FROM productsCarts WHERE cartId = '${"cartId"}' AND productId = '${"productId"}'`,
    );
    expect(getQuantityInCartSpy).toHaveBeenCalledWith("cartId", "productId");
  });
  it("should update quantity in cart if selected quantity is less than quantity in cart", async () => {
    getQuantityInCartSpy.mockResolvedValue(TWO_ITEMS);
    await removeFromCart("cartId", "productId", ONE_ITEM);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `UPDATE productsCarts SET quantity = ${TWO_ITEMS - ONE_ITEM} WHERE cartId = '${"cartId"}' AND productId = '${"productId"}'`,
    );
    expect(getQuantityInCartSpy).toHaveBeenCalledWith("cartId", "productId");
  });
  it("should remove product from cart if selected quantity is greater than quantity in cart", async () => {
    getQuantityInCartSpy.mockResolvedValue(ONE_ITEM);
    await removeFromCart("cartId", "productId", TWO_ITEMS);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `DELETE FROM productsCarts WHERE cartId = '${"cartId"}' AND productId = '${"productId"}'`,
    );
    expect(getQuantityInCartSpy).toHaveBeenCalledWith("cartId", "productId");
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(
      removeFromCart("cartId", "productId", ONE_ITEM),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getQuantityInCartSpy).toHaveBeenCalledWith("cartId", "productId");
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if getQuantityInCart throws error", async () => {
    getQuantityInCartSpy.mockImplementationOnce(() => {
      throw new Error("getQuantityInCart error");
    });
    await expect(
      removeFromCart("cartId", "productId", ONE_ITEM),
    ).rejects.toEqual(
      expect.objectContaining({ message: "getQuantityInCart error" }),
    );
    expect(prepareStatementSpy).not.toHaveBeenCalled();
  });
  it("should throw error if run throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      run: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(
      removeFromCart("cartId", "productId", ONE_ITEM),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    expect(getQuantityInCartSpy).toHaveBeenCalledWith("cartId", "productId");
  });
});
