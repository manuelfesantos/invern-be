import { getProducts } from "./get-products";
import * as DbUtils from "@db-utils";
import { prepareStatementMock, productsMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

const resultMock = productsMock.map((product) => ({
  ...product,
  description: undefined,
  imageUrl: product.productImage?.imageUrl || "",
  imageAlt: product.productImage?.imageAlt || "",
  collectionName: undefined,
}));

describe("getProducts", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should get products", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockResolvedValue({ results: resultMock }),
    });
    const result = await getProducts(null);
    expect(result).toEqual(productsMock);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT products.productId, productName, price, stock, url as imageUrl, alt as imageAlt FROM products
            LEFT JOIN images ON products.productId = images.productId
            GROUP BY products.productId`,
    );
  });
  it("should get products by search", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockResolvedValue({ results: resultMock }),
    });
    const result = await getProducts("search");
    expect(result).toEqual(productsMock);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT products.productId, productName, price, stock, url as imageUrl, alt as imageAlt FROM products 
            JOIN images ON products.productId = images.productId
            WHERE productName LIKE '%search%' OR description LIKE '%search%'
            GROUP BY products.productId`,
    );
  });
  it("should throw an error if prepareStatement throws an error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(getProducts(null)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw an error if prepareStatement.all throws an error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(getProducts(null)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
