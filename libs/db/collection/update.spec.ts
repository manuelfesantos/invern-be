import { updateCollection } from "./update";
import * as DB from "@db";
import { collectionsTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("updateCollection", () => {
  const setSpy = jest.spyOn(DB.db().update(collectionsTable), "set");
  it("should update a collection", async () => {
    const collectionId = "1";
    const changes = {
      collectionName: "newName",
    };
    const result = await updateCollection(collectionId, changes);
    expect(result).toBeUndefined();
    expect(setSpy).toHaveBeenCalledWith(changes);
  });
});
