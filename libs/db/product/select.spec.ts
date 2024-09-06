import {
  getProductById,
  getProducts,
  getProductsByCollectionId,
  getProductsByProductIds,
  getProductsBySearch,
} from "./select";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      productsTable: {
        findFirst: jest.fn().mockReturnValue({
          id: "1",
          name: "product name",
          description: "product description",
        }),
        findMany: jest.fn().mockReturnValue([
          {
            id: "1",
            name: "product name",
            description: "product description",
          },
        ]),
      },
    },
  }),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("get", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("product by id", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.productsTable, "findFirst");
    it("should get product by id", async () => {
      const productId = "1";
      const result = await getProductById(productId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual({
        id: "1",
        name: "product name",
        description: "product description",
      });
    });
  });
  describe("products", () => {
    const findManySpy = jest.spyOn(DB.db().query.productsTable, "findMany");
    it("should get products", async () => {
      const result = await getProducts();
      expect(findManySpy).toHaveBeenCalled();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual({
        id: "1",
        name: "product name",
        description: "product description",
      });
    });
    describe("by product ids", () => {
      it("should get products by product ids", async () => {
        const productIds = ["1"];
        const result = await getProductsByProductIds(productIds);
        expect(findManySpy).toHaveBeenCalled();
        expect(result).toHaveLength(ONE_ELEMENT);
        expect(result[FIRST_ELEMENT]).toEqual({
          id: "1",
          name: "product name",
          description: "product description",
        });
      });
    });
    describe("by collection id", () => {
      it("should get products by collection id", async () => {
        const collectionId = "1";
        const result = await getProductsByCollectionId(collectionId);
        expect(findManySpy).toHaveBeenCalled();
        expect(result).toHaveLength(ONE_ELEMENT);
        expect(result[FIRST_ELEMENT]).toEqual({
          id: "1",
          name: "product name",
          description: "product description",
        });
      });
    });
    describe("by search", () => {
      it("should get products by search", async () => {
        const search = "search";
        const result = await getProductsBySearch(search);
        expect(findManySpy).toHaveBeenCalled();
        expect(result).toHaveLength(ONE_ELEMENT);
        expect(result[FIRST_ELEMENT]).toEqual({
          id: "1",
          name: "product name",
          description: "product description",
        });
      });
    });
  });
});
