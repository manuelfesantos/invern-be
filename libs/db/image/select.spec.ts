import { getImageByCollectionId, getImagesByProductId } from "./select";

import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      imagesTable: {
        findMany: jest.fn().mockReturnValue([
          {
            url: "url",
            alt: "alt",
            productId: "productId",
          },
        ]),
        findFirst: jest.fn().mockReturnValue({
          url: "url",
          alt: "alt",
          productId: "productId",
        }),
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
  describe("images by productId", () => {
    const findManySpy = jest.spyOn(DB.db().query.imagesTable, "findMany");
    it("should get images by productId", async () => {
      const productId = "1";
      const result = await getImagesByProductId(productId);
      expect(findManySpy).toHaveBeenCalled();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual({
        url: "url",
        alt: "alt",
        productId: "productId",
      });
    });
  });
  describe("image by collectionId", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.imagesTable, "findFirst");
    it("should get image by collectionId", async () => {
      const collectionId = "1";
      const result = await getImageByCollectionId(collectionId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual({
        url: "url",
        alt: "alt",
        productId: "productId",
      });
    });
  });
});
