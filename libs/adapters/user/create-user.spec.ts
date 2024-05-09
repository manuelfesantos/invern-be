import { createUser } from "./create-user";
import * as DbUtils from "@db-utils";
import { prepareStatementMock, userMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("createUser", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  const bindSpy = jest.spyOn(prepareStatementMock, "bind");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should create user", async () => {
    expect(async () => await createUser(userMock)).not.toThrow();
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `INSERT INTO users (userId, email, firstName, lastName, password, cartId) VALUES(?, ?, ?, ?, ?, ?)`,
    );
    expect(bindSpy).toHaveBeenCalledWith(
      userMock.userId,
      userMock.email,
      userMock.firstName,
      userMock.lastName,
      userMock.password,
      userMock.cart?.cartId || null,
    );
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    expect(async () => await createUser(userMock)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    expect(bindSpy).not.toHaveBeenCalled();
  });
  it("should throw error if bind throws error", async () => {
    bindSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    expect(async () => await createUser(userMock)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    expect(bindSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if run throws error", async () => {
    bindSpy.mockReturnValueOnce({
      run: jest.fn().mockRejectedValue(new Error("database error")),
    });
    expect(async () => await createUser(userMock)).rejects.toEqual(
      expect.objectContaining({ message: "database error" }),
    );
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    expect(bindSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
