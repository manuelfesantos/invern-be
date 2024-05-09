import { getImagesByProductId } from "./get-images-by-product-id";
import * as DbUtils from "@db-utils";
import { imagesMock, prepareStatementMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("getImagesByProductId", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });

  it("should get images by product id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockResolvedValue({ results: imagesMock }),
    });
    const result = await getImagesByProductId(
      "b333a655-f0bb-43f0-86e1-57bc80325c79",
    );
    expect(result).toEqual(imagesMock);
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT url as imageUrl, alt as imageAlt FROM images WHERE productId = 'b333a655-f0bb-43f0-86e1-57bc80325c79'`,
    );
  });
  it("should throw error if prepareStatement.all throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      all: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(
      getImagesByProductId("b333a655-f0bb-43f0-86e1-57bc80325c79"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(
      getImagesByProductId("b333a655-f0bb-43f0-86e1-57bc80325c79"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
