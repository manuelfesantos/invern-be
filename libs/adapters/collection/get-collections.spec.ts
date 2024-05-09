import { getCollections } from "./get-collections";
import * as DbUtils from "@db-utils";
import { collectionsMock, prepareStatementMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

const resultsMock = collectionsMock.map((collection) => ({
  ...collection,
  imageUrl: collection.collectionImage?.imageUrl || "",
  imageAlt: collection.collectionImage?.imageAlt || "",
  description: undefined,
}));

describe("getCollections", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should get collections", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockResolvedValue({ results: resultsMock }),
    });
    const result = await getCollections();
    expect(result).toEqual(
      collectionsMock.map((collection) => ({
        ...collection,
        description: undefined,
      })),
    );
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT collections.collectionId, collectionName, url AS imageUrl, alt AS imageAlt FROM collections
            JOIN images ON collections.collectionId = images.collectionId`,
    );
  });
  it("should throw error if prepareStatement.all throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(getCollections()).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(getCollections()).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
