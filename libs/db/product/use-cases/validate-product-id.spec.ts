import { validateProductId, validateProductIds } from "@product-db";
import { ZodError } from "zod";
import * as DB from "@db";
import { errors } from "@error-handling-utils";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      productsTable: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
  }),
}));

const product = {
  productId: "pGnFzJ177Yeh4sTz1wDMRM",
  productName: "product name",
  description: "product description",
  stock: 1,
  priceInCents: 1,
  collectionId: "1",
};

describe("validate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("productId", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.productsTable, "findFirst");
    it("should validate product id", async () => {
      findFirstSpy.mockResolvedValue(product);
      expect(
        async () => await validateProductId(product.productId),
      ).not.toThrow();
    });

    it("should throw error if product id is invalid", async () => {
      const productId = "1";
      await expect(
        async () => await validateProductId(productId),
      ).rejects.toBeInstanceOf(ZodError);
    });

    it("should throw error if product is not found", async () => {
      findFirstSpy.mockResolvedValue(undefined);
      await expect(
        async () => await validateProductId(product.productId),
      ).rejects.toEqual(errors.PRODUCT_NOT_FOUND());
    });
  });
  describe("productIds", () => {
    const findManySpy = jest.spyOn(DB.db().query.productsTable, "findMany");
    it("should validate product ids", async () => {
      findManySpy.mockResolvedValue([product]);
      expect(
        async () => await validateProductIds([product.productId]),
      ).not.toThrow();
    });

    it("should throw error if product ids are invalid", async () => {
      const productIds = ["1"];
      await expect(
        async () => await validateProductIds(productIds),
      ).rejects.toBeInstanceOf(ZodError);
    });

    it("should throw error if product is not found", async () => {
      findManySpy.mockResolvedValue([]);
      await expect(
        async () => await validateProductIds([product.productId]),
      ).rejects.toEqual(errors.INVALID_PRODUCT_IDS([product.productId]));
    });
    it("should throw error if productId is not equal to saved productId", async () => {
      findManySpy.mockResolvedValue([
        { ...product, productId: "a5UiXLP6yGHtbDg8wwaJbe" },
      ]);
      await expect(
        async () =>
          await validateProductIds([
            product.productId,
            "a5UiXLP6yGHtbDg8wwaJbe",
          ]),
      ).rejects.toEqual(errors.INVALID_PRODUCT_IDS([product.productId]));
    });
  });
});
