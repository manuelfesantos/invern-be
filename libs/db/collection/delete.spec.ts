import { deleteCollection } from "./delete";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteCollection", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  it("should delete a collection", async () => {
    const collectionId = "1";
    const result = await deleteCollection(collectionId);
    expect(result).toBeUndefined();
    expect(deleteSpy).toHaveBeenCalled();
  });
});
