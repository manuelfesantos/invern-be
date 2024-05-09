import { getProductsByCollectionId } from "./get-products-by-collection-id";
import * as DbUtils from "@db-utils";
import { prepareStatementMock, productsMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

const resultsMock = productsMock.map((product) => ({
  ...product,
  description: undefined,
  imageUrl: product.productImage?.imageUrl || "",
  imageAlt: product.productImage?.imageAlt || "",
  collectionName: undefined,
}));

describe("getProductsByCollectionId", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should get products by collection id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockResolvedValue({ results: resultsMock }),
    });
    const result = await getProductsByCollectionId("collectionId");
    expect(result).toEqual(productsMock);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT products.productId, productName, price, stock, url as imageUrl, alt as imageAlt FROM products 
            LEFT JOIN images ON products.productId = images.productId
            WHERE products.collectionId = '${"collectionId"}'
            GROUP BY products.productId`,
    );
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(getProductsByCollectionId("collectionId")).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if prepareStatement.all throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(getProductsByCollectionId("collectionId")).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
