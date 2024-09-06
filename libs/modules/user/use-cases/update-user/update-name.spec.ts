import { updateName } from "./update-name";
import { successResponse } from "@response-entity";
import { compareResponses, userMock } from "@mocks-utils";
import * as UserAdapter from "@user-db";
import { ZodError } from "zod";
import { DEFAULT_USER_VERSION, userToUserDTO } from "@user-entity";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  updateUser: jest.fn(),
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

const tokens = {
  accessToken: "token",
  refreshToken: "refreshToken",
};

describe("updateName", () => {
  const updateUserSpy = jest.spyOn(UserAdapter, "updateUser");
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should update first and last name", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const firstName = "newFirstName";
    const lastName = "newLastName";
    const { response, version } = await updateName(tokens, id, {
      firstName,
      lastName,
    });
    const expectedResponse = successResponse.OK("user name updated", {
      user: {
        ...userToUserDTO(userMock),
        firstName,
        lastName,
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(version).toEqual(userMock.version);
  });
  it("should update only first name", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const firstName = "newFirstName";
    const { response } = await updateName(tokens, id, { firstName });
    const expectedResponse = successResponse.OK("user name updated", {
      user: {
        ...userToUserDTO(userMock),
        firstName,
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should update only last name", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const lastName = "newLastName";
    const { response } = await updateName(tokens, id, { lastName });
    const expectedResponse = successResponse.OK("user name updated", {
      user: {
        ...userToUserDTO(userMock),
        lastName,
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should throw error if neither first name or last name is provided", async () => {
    const id = "userId";
    await expect(
      async () => await updateName(tokens, id, {}),
    ).rejects.toBeInstanceOf(ZodError);
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(getUserByIdSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    const firstName = "newFirstName";
    const lastName = "newLastName";
    await expect(
      async () => await updateName(tokens, id, { firstName, lastName }),
    ).rejects.toEqual(expect.objectContaining({ message: "user not found" }));
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if update fails", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const firstName = "newFirstName";
    const lastName = "newLastName";
    updateUserSpy.mockRejectedValueOnce(new Error("update failed"));
    await expect(
      async () => await updateName(tokens, id, { firstName, lastName }),
    ).rejects.toEqual(expect.objectContaining({ message: "update failed" }));
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).toHaveBeenCalledWith(userMock.userId, {
      firstName,
      lastName,
    });
  });
  it("should return default user version if user does not have version", async () => {
    const userWithoutVersion = { ...userMock, version: undefined };
    getUserByIdSpy.mockResolvedValueOnce(userWithoutVersion);
    const id = "userId";
    const firstName = "newFirstName";
    const lastName = "newLastName";
    const { response, version } = await updateName(tokens, id, {
      firstName,
      lastName,
    });
    const expectedResponse = successResponse.OK("user name updated", {
      user: {
        ...userToUserDTO(userWithoutVersion),
        firstName,
        lastName,
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(version).toEqual(DEFAULT_USER_VERSION);
  });
});
