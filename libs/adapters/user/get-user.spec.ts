import { getUserByEmail } from "./get-user";
import { getUserById } from "./get-user";
import * as DbUtils from "@db-utils";
import { prepareStatementMock, userMock } from "@mocks-utils";

const ONE_TIME_CALLED = 1;

jest.mock("@db-utils", () => ({
  prepareStatement: jest.fn(),
}));

describe("getUser", () => {
  const prepareStatementSpy = jest.spyOn(DbUtils, "prepareStatement");
  beforeEach(() => {
    jest.clearAllMocks();
    prepareStatementSpy.mockReturnValue(prepareStatementMock);
  });
  describe("getUserByEmail", () => {
    it("should get user by email", async () => {
      prepareStatementSpy.mockReturnValue({
        ...prepareStatementMock,
        first: jest.fn().mockResolvedValue({
          userId: userMock.userId,
          email: userMock.email,
          firstName: userMock.firstName,
          lastName: userMock.lastName,
          password: userMock.password,
          cartId: userMock.cart?.cartId || null,
        }),
      });
      const result = await getUserByEmail("email");
      expect(result).toEqual({
        userId: userMock.userId,
        email: userMock.email,
        firstName: userMock.firstName,
        lastName: userMock.lastName,
        password: userMock.password,
        cart: userMock.cart,
        roles: userMock.roles,
      });
      expect(prepareStatementSpy).toHaveBeenCalledWith(
        `SELECT * FROM users WHERE email = '${"email"}'`,
      );
    });
    it("should throw error if prepareStatement throws error", async () => {
      prepareStatementSpy.mockImplementation(() => {
        throw new Error("database error");
      });
      await expect(async () => await getUserByEmail("email")).rejects.toEqual(
        expect.objectContaining({ message: "database error" }),
      );
      expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    });
    it("should throw error if prepareStatement.first throws error", async () => {
      prepareStatementSpy.mockReturnValue({
        ...prepareStatementMock,
        first: jest.fn().mockRejectedValue(new Error("database error")),
      });
      await expect(async () => await getUserByEmail("email")).rejects.toEqual(
        expect.objectContaining({ message: "database error" }),
      );
      expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    });
  });
  describe("getUserById", () => {
    it("should get user by id", async () => {
      prepareStatementSpy.mockReturnValue({
        ...prepareStatementMock,
        first: jest.fn().mockResolvedValue({
          userId: userMock.userId,
          email: userMock.email,
          firstName: userMock.firstName,
          lastName: userMock.lastName,
          password: userMock.password,
          cartId: userMock.cart?.cartId || null,
        }),
      });
      const result = await getUserById(userMock.userId);
      expect(result).toEqual({
        userId: userMock.userId,
        email: userMock.email,
        firstName: userMock.firstName,
        lastName: userMock.lastName,
        password: userMock.password,
        cart: userMock.cart,
        roles: userMock.roles,
      });
      expect(prepareStatementSpy).toHaveBeenCalledWith(
        `SELECT * FROM users WHERE userId = '${userMock.userId}'`,
      );
    });
    it("should throw error if user not found", async () => {
      prepareStatementSpy.mockReturnValue({
        ...prepareStatementMock,
        first: jest.fn().mockResolvedValue(null),
      });
      await expect(
        async () => await getUserById(userMock.userId),
      ).rejects.toEqual(expect.objectContaining({ message: "User not found" }));
      expect(prepareStatementSpy).toHaveBeenCalled();
    });
    it("should throw error if prepareStatement throws error", async () => {
      prepareStatementSpy.mockImplementation(() => {
        throw new Error("database error");
      });
      await expect(
        async () => await getUserById(userMock.userId),
      ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
      expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    });
    it("should throw error if prepareStatement.first throws error", async () => {
      prepareStatementSpy.mockReturnValue({
        ...prepareStatementMock,
        first: jest.fn().mockRejectedValue(new Error("database error")),
      });
      await expect(
        async () => await getUserById(userMock.userId),
      ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
      expect(prepareStatementSpy).toHaveBeenCalledTimes(ONE_TIME_CALLED);
    });
  });
});
