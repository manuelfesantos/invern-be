import { getQuantityInCart } from "./get-quantity-in-cart";
import * as DbAdapter from "@db-utils";
import { prepareStatementMock } from "@mocks-utils";

const EXPECTED_QUANTITY = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("getQuantityInCart", () => {
  const prepareStatementSpy = jest.spyOn(DbAdapter, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should get quantity in cart", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue({ quantity: EXPECTED_QUANTITY }),
    });
    const quantity = await getQuantityInCart("cartId", "productId");
    expect(quantity).toEqual(EXPECTED_QUANTITY);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT quantity FROM productsCarts WHERE cartId = '${"cartId"}' AND productId = '${"productId"}'`,
    );
  });

  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(getQuantityInCart("cartId", "productId")).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT quantity FROM productsCarts WHERE cartId = '${"cartId"}' AND productId = '${"productId"}'`,
    );
  });
  it("should throw error if product does not exist in cart", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue(null),
    });
    await expect(getQuantityInCart("cartId", "productId")).rejects.toEqual(
      expect.objectContaining({ message: "Product not in cart" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT quantity FROM productsCarts WHERE cartId = '${"cartId"}' AND productId = '${"productId"}'`,
    );
  });
});
