import { getCollectionDetails } from "./get-collection-details";
import { successResponse } from "@response-entity";
import * as CollectionAdapter from "@collection-adapter";
import * as ProductAdapter from "@product-adapter";
import { collectionsMock, compareResponses } from "@mocks-utils";
import { ZodError } from "zod";

const FIRST_ELEMENT = 0;
const collectionId = "a6768fef-a5af-4968-bacc-32b1781d9280";

jest.mock("@collection-adapter", () => ({
  getCollectionById: jest.fn(),
}));

jest.mock("@product-adapter", () => ({
  getProductsByCollectionId: jest.fn(),
}));

describe("getCollectionDetails", () => {
  const getCollectionByIdSpy = jest.spyOn(
    CollectionAdapter,
    "getCollectionById",
  );
  const getProductsByCollectionIdSpy = jest.spyOn(
    ProductAdapter,
    "getProductsByCollectionId",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get collection details", async () => {
    getCollectionByIdSpy.mockResolvedValueOnce(collectionsMock[FIRST_ELEMENT]);
    getProductsByCollectionIdSpy.mockResolvedValueOnce([]);
    const response = await getCollectionDetails(collectionId);
    const expectedResponse = successResponse.OK(
      "success getting collection details",
      {
        ...collectionsMock[FIRST_ELEMENT],
        products: [],
        collectionImage: undefined,
      },
    );
    await compareResponses(response, expectedResponse);
    expect(getCollectionByIdSpy).toHaveBeenCalled();
    expect(getProductsByCollectionIdSpy).toHaveBeenCalled();
  });
  it("should throw an error if collection id is invalid", async () => {
    await expect(
      async () => await getCollectionDetails("invalid"),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getCollectionByIdSpy).not.toHaveBeenCalled();
    expect(getProductsByCollectionIdSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if getCollectionById throws an error", async () => {
    getCollectionByIdSpy.mockRejectedValueOnce(new Error("database error"));
    await expect(
      async () => await getCollectionDetails(collectionId),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getCollectionByIdSpy).toHaveBeenCalled();
    expect(getProductsByCollectionIdSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if getProductsByCollectionId throws an error", async () => {
    getCollectionByIdSpy.mockResolvedValueOnce(collectionsMock[FIRST_ELEMENT]);
    getProductsByCollectionIdSpy.mockRejectedValueOnce(
      new Error("database error"),
    );
    await expect(
      async () => await getCollectionDetails(collectionId),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getCollectionByIdSpy).toHaveBeenCalled();
    expect(getProductsByCollectionIdSpy).toHaveBeenCalled();
  });
});
