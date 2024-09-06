import { getCollectionDetails } from "./get-collection-details";
import { successResponse } from "@response-entity";
import * as CollectionAdapter from "@collection-db";
import { collectionDetailsMock, compareResponses } from "@mocks-utils";
import { ZodError } from "zod";

const collectionId = "gqgX5N33RQwJrAjYH1JZTk";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@collection-db", () => ({
  getCollectionById: jest.fn(),
}));

jest.mock("@product-db", () => ({
  getProductsByCollectionId: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({}));

describe("getCollectionDetails", () => {
  const getCollectionByIdSpy = jest.spyOn(
    CollectionAdapter,
    "getCollectionById",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get collection details", async () => {
    getCollectionByIdSpy.mockResolvedValueOnce(collectionDetailsMock);
    const response = await getCollectionDetails(collectionId);
    const expectedResponse = successResponse.OK(
      "success getting collection details",
      collectionDetailsMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getCollectionByIdSpy).toHaveBeenCalled();
  });
  it("should throw an error if collection id is invalid", async () => {
    await expect(
      async () => await getCollectionDetails("invalid"),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getCollectionByIdSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if getCollectionById throws an error", async () => {
    getCollectionByIdSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(
      async () => await getCollectionDetails(collectionId),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getCollectionByIdSpy).toHaveBeenCalled();
  });
  it("should throw an error if the collection is not found", async () => {
    getCollectionByIdSpy.mockResolvedValueOnce(undefined);
    await expect(
      async () => await getCollectionDetails(collectionId),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Collection not found" }),
    );
    expect(getCollectionByIdSpy).toHaveBeenCalled();
  });
});
