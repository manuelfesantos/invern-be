import { updatePassword } from "./update-password";
import * as UserAdapter from "@user-db";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import { ZodError } from "zod";
import { DEFAULT_USER_VERSION, userToUserDTO } from "@user-entity";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  getUserById: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock("@crypto-utils", () => ({
  hashPassword: jest.fn((password: string) => password),
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

const tokens = {
  refreshToken: "refreshToken",
  accessToken: "accessToken",
};

describe("updatePassword", () => {
  const updateUserSpy = jest.spyOn(UserAdapter, "updateUser");
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should update password", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const password = "newPassword";
    const { response, version } = await updatePassword(tokens, id, {
      password,
    });
    const expectedResponse = successResponse.OK("user password updated", {
      user: {
        ...userToUserDTO(userMock),
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(version).toEqual(userMock.version);
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).toHaveBeenCalledWith(id, { password });
  });
  it("should throw error if password is invalid", async () => {
    const id = "userId";
    const password = "";
    await expect(
      async () => await updatePassword(tokens, id, { password }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByIdSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    const password = "newPassword";
    await expect(
      async () => await updatePassword(tokens, id, { password }),
    ).rejects.toEqual(expect.objectContaining({ message: "user not found" }));
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).not.toHaveBeenCalled();
  });
  it("should return default user version if user does not have version", async () => {
    const userWithoutVersion = { ...userMock, version: undefined };
    getUserByIdSpy.mockResolvedValueOnce(userWithoutVersion);
    const id = "userId";
    const password = "newPassword";
    const { response, version } = await updatePassword(tokens, id, {
      password,
    });
    const expectedResponse = successResponse.OK("user password updated", {
      user: {
        ...userToUserDTO(userWithoutVersion),
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(version).toEqual(DEFAULT_USER_VERSION);
  });
});
