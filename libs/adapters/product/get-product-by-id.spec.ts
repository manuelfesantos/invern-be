import { getProductById } from "./get-product-by-id";
import * as DbUtils from "@db-utils";
import { prepareStatementMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("getProductById", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });

  it("should get product by id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue({
        productId: "b333a655-f0bb-43f0-86e1-57bc80325c79",
      }),
    });
    const result = await getProductById("b333a655-f0bb-43f0-86e1-57bc80325c79");
    expect(result).toEqual({
      productId: "b333a655-f0bb-43f0-86e1-57bc80325c79",
    });
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT productId, productName, products.description, price, stock, collectionName FROM products 
            JOIN collections ON products.collectionId = collections.collectionId
            WHERE productId = 'b333a655-f0bb-43f0-86e1-57bc80325c79'`,
    );
  });
  it("should throw error if prepareStatement.first throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(
      getProductById("b333a655-f0bb-43f0-86e1-57bc80325c79"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(
      getProductById("b333a655-f0bb-43f0-86e1-57bc80325c79"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if there is no product with that id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue(null),
    });
    await expect(
      getProductById("b333a655-f0bb-43f0-86e1-57bc80325c79"),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Product not found" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
