import { deleteUser } from "./delete-user";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as UserAdapter from "@user-db";

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  deleteUser: jest.fn(),
  getUserById: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({
  getAnonymousTokens: jest.fn(() => ({
    token: "token",
    refreshToken: "refreshToken",
  })),
  getTokenCookie: jest.fn(),
}));

jest.mock("@kv-adapter", () => ({
  setAuthSecret: jest.fn(),
}));

const tokens = { refreshToken: "refreshToken", accessToken: "token" };

const remember = true;

describe("deleteUser", () => {
  const deleteUserSpy = jest.spyOn(UserAdapter, "deleteUser");
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should delete user", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const response = await deleteUser(tokens, remember, id);
    const expectedResponse = successResponse.OK("success deleting user", {
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(deleteUserSpy).toHaveBeenCalledWith(userMock.id);
  });
  it("should throw error when user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    await expect(
      async () => await deleteUser(tokens, remember, id),
    ).rejects.toBeInstanceOf(Error);
    expect(deleteUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error when delete user fails", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    deleteUserSpy.mockRejectedValueOnce(new Error("delete user failed"));
    const id = "userId";
    await expect(
      async () => await deleteUser(tokens, remember, id),
    ).rejects.toEqual(
      expect.objectContaining({ message: "delete user failed" }),
    );
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(deleteUserSpy).toHaveBeenCalled();
  });
  it("should throw an error if user id is not provided", async () => {
    await expect(
      async () => await deleteUser(tokens, remember),
    ).rejects.toEqual(expect.objectContaining({ message: "Unauthorized" }));
    expect(deleteUserSpy).not.toHaveBeenCalled();
  });
});
