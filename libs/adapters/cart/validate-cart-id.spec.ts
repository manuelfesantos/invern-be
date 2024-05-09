import { validateCartId } from "./validate-cart-id";
import * as DbUtils from "@db-utils";
import { prepareStatementMock } from "@mocks-utils";
import { ZodError } from "zod";

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

const cartId = "b333a655-f0bb-43f0-86e1-57bc80325c79";

describe("validateCartId", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should not throw error if cartId is valid", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue({}),
    });
    await expect(validateCartId(cartId)).resolves.not.toThrow();
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT cartId FROM users WHERE cartId = '${cartId}'`,
    );
  });
  it("should throw error if cartId is not valid", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockResolvedValue(null),
    });
    await expect(validateCartId(cartId)).rejects.toEqual(
      expect.objectContaining({ message: "Cart not found" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT cartId FROM users WHERE cartId = '${cartId}'`,
    );
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error();
    });
    await expect(validateCartId(cartId)).rejects.toThrow();
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT cartId FROM users WHERE cartId = '${cartId}'`,
    );
  });
  it("should throw error if first throws error", async () => {
    prepareStatementSpy.mockReturnValue({
      ...prepareStatementMock,
      first: jest.fn().mockRejectedValue(new Error()),
    });
    await expect(validateCartId(cartId)).rejects.toThrow();
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `SELECT cartId FROM users WHERE cartId = '${cartId}'`,
    );
  });
  it("should throw error if cartId is not a valid uuid", async () => {
    await expect(validateCartId("cartId")).rejects.toBeInstanceOf(ZodError);
    expect(prepareStatementSpy).not.toHaveBeenCalled();
  });
});
