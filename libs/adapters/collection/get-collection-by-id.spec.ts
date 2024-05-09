import { getCollectionById } from "./get-collection-by-id";
import * as DbUtils from "@db-utils";
import { collectionsMock, prepareStatementMock } from "@mocks-utils";

const FIRST_INDEX = 0;
const ONE_TIME_CALLED = 1;

const collectionMock = collectionsMock[FIRST_INDEX];

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("getCollectionById", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should get collection by id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue(collectionMock),
    });
    const result = await getCollectionById("collectionId");
    expect(result).toEqual(collectionMock);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT collections.collectionId, collectionName, description FROM collections 
            WHERE collections.collectionId = '${"collectionId"}'`,
    );
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(getCollectionById("collectionId")).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if prepareStatement.first throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(getCollectionById("collectionId")).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if there is no collection with that id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue(null),
    });
    await expect(getCollectionById("collectionId")).rejects.toEqual(
      expect.objectContaining({ message: "Collection not found" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT collections.collectionId, collectionName, description FROM collections 
            WHERE collections.collectionId = '${"collectionId"}'`,
    );
  });
});
