import { insertCollection } from "./insert";
import * as DB from "@db";
import { collectionsTable } from "@schema";
import * as Crypto from "@crypto-utils";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            collectionId: "collectionId",
          },
        ]),
      }),
    }),
  }),
}));

jest.mock("@crypto-utils", () => ({
  getRandomUUID: jest.fn().mockReturnValue("collectionId"),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("insertCollection", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(collectionsTable), "values");
  const getRandomUUIDSpy = jest.spyOn(Crypto, "getRandomUUID");
  it("should insert a collection", async () => {
    const collection = {
      name: "test",
      description: "test",
    };
    const result = await insertCollection(collection);
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT].collectionId).toBe("collectionId");
    expect(getRandomUUIDSpy).toHaveBeenCalled();
    expect(valuesSpy).toHaveBeenCalledWith({
      ...collection,
      id: "collectionId",
    });
  });
});
