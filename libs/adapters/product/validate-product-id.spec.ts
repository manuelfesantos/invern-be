import { validateProductId } from "./validate-product-id";
import * as DbUtils from "@db-utils";
import { prepareStatementMock } from "@mocks-utils";
import { ZodError } from "zod";

const ONE_TIME_CALLED = 1;
const validProductId = "b333a655-f0bb-43f0-86e1-57bc80325c79";
const invalidProductId = "invalid-id";

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("validateProductId", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should validate product id", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue({
        productId: validProductId,
      }),
    });
    expect(async () => await validateProductId(validProductId)).not.toThrow();
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT productId FROM products WHERE productId = '${validProductId}'`,
    );
  });
  it("should throw error if product id is invalid", async () => {
    await expect(validateProductId(invalidProductId)).rejects.toBeInstanceOf(
      ZodError,
    );
    expect(prepareStatementSpy).not.toHaveBeenCalled();
  });
  it("should throw error if product id is not found", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue(null),
    });
    await expect(validateProductId(validProductId)).rejects.toEqual(
      expect.objectContaining({ message: "Product not found" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(validateProductId(validProductId)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if prepareStatement.first throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(validateProductId(validProductId)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
