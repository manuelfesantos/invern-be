import { updateUser } from "./update-user";
import * as DbUtils from "@db-utils";
import { prepareStatementMock, userMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("updateUser", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  const bindSpy = jest.spyOn(prepareStatementMock, "bind");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  it("should update user", async () => {
    await updateUser(userMock.userId, "name = 'test'");
    expect(prepareStatementSpy).toHaveBeenCalledWith(
      `UPDATE users SET name = 'test' WHERE userId = ?`,
    );
    expect(bindSpy).toHaveBeenCalledWith(userMock.userId);
  });
  it("should throw error if prepareStatement throws error", async () => {
    prepareStatementSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(
      async () => await updateUser(userMock.userId, "name = 'test'"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    expect(bindSpy).not.toHaveBeenCalled();
  });
  it("should throw error if bind throws error", async () => {
    bindSpy.mockImplementation(() => {
      throw new Error("database error");
    });
    await expect(
      async () => await updateUser(userMock.userId, "name = 'test'"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    expect(bindSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
  it("should throw error if run throws error", async () => {
    bindSpy.mockReturnValueOnce({
      run: jest.fn().mockRejectedValue(new Error("database error")),
    });
    await expect(
      async () => await updateUser(userMock.userId, "name = 'test'"),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    expect(bindSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
  });
});
