import { getAllCollections } from "./get-all-collections";
import { collectionsMock, compareResponses } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as CollectionAdapter from "@collection-db";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@collection-db", () => ({
  getCollections: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({}));

describe("getAllCollections", () => {
  const getCollectionsSpy = jest.spyOn(CollectionAdapter, "getCollections");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get all collections", async () => {
    getCollectionsSpy.mockResolvedValueOnce(collectionsMock);
    const response = await getAllCollections();
    const expectedResponse = successResponse.OK(
      "success getting collections",
      collectionsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getCollectionsSpy).toHaveBeenCalled();
  });
  it("should throw an error if getCollections throws an error", async () => {
    getCollectionsSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(async () => await getAllCollections()).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(getCollectionsSpy).toHaveBeenCalled();
  });
});
