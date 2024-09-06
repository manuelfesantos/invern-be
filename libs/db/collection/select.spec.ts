import {
  getCollectionById,
  getCollectionByName,
  getCollections,
} from "./select";

import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      collectionsTable: {
        findMany: jest.fn().mockReturnValue([
          {
            collectionId: "1",
            collectionName: "collectionName",
          },
        ]),
        findFirst: jest.fn().mockReturnValue({
          collectionId: "1",
          collectionName: "collectionName",
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
  describe("collections", () => {
    const findManySpy = jest.spyOn(DB.db().query.collectionsTable, "findMany");
    it("should get collections", async () => {
      const result = await getCollections();
      expect(findManySpy).toHaveBeenCalled();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual({
        collectionId: "1",
        collectionName: "collectionName",
      });
    });
  });

  describe("collectionById", () => {
    const findFirstSpy = jest.spyOn(
      DB.db().query.collectionsTable,
      "findFirst",
    );
    it("should get collection by id", async () => {
      const collectionId = "1";
      const result = await getCollectionById(collectionId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual({
        collectionId: "1",
        collectionName: "collectionName",
      });
    });
  });
  describe("collectionByName", () => {
    const findFirstSpy = jest.spyOn(
      DB.db().query.collectionsTable,
      "findFirst",
    );
    it("should get collection by name", async () => {
      const collectionName = "collectionName";
      const result = await getCollectionByName(collectionName);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual({
        collectionId: "1",
        collectionName: "collectionName",
      });
    });
  });
});
