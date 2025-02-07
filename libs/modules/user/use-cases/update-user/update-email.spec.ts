import { updateEmail } from "./update-email";
import { successResponse } from "@response-entity";
import * as UserAdapter from "@user-db";
import { compareResponses, userMock } from "@mocks-utils";
import { ZodError } from "zod";
import { userToUserDTO } from "@user-entity";

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  updateUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
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

describe("updateEmail", () => {
  const updateUserSpy = jest.spyOn(UserAdapter, "updateUser");
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  const getUserByEmailSpy = jest.spyOn(UserAdapter, "getUserByEmail");
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update mail", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const email = "newEmail@example.com";
    const response = await updateEmail(tokens, undefined, id, { email });
    const expectedResponse = successResponse.OK("user email updated", {
      user: {
        ...userToUserDTO(userMock),
        email,
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(getUserByEmailSpy).toHaveBeenCalled();
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).toHaveBeenCalledWith(id, { email });
  });
  it("should throw error if mail is invalid", async () => {
    const id = "userId";
    const email = "invalidEmail";
    await expect(
      async () => await updateEmail(tokens, undefined, id, { email }),
    ).rejects.toBeInstanceOf(ZodError);
  });
  it("should throw error if user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    const email = "newEmail@example.com";
    await expect(
      async () => await updateEmail(tokens, undefined, id, { email }),
    ).rejects.toEqual(expect.objectContaining({ message: "user not found" }));
    expect(getUserByEmailSpy).toHaveBeenCalled();
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if mail already taken", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const email = "newEmail@example.com";
    await expect(
      async () => await updateEmail(tokens, undefined, id, { email }),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Email already taken", code: 409 }),
    );
    expect(getUserByEmailSpy).toHaveBeenCalled();
    expect(getUserByIdSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
  });
  it("should return default user version if user does not have version", async () => {
    const userWithoutVersion = { ...userMock, version: undefined };
    getUserByIdSpy.mockResolvedValueOnce(userWithoutVersion);
    const id = "userId";
    const email = "newEmail@example.com";
    const response = await updateEmail(tokens, undefined, id, { email });
    const expectedResponse = successResponse.OK("user email updated", {
      user: {
        ...userToUserDTO(userWithoutVersion),
        email,
      },
      accessToken: tokens.accessToken,
    });
    await compareResponses(response, expectedResponse);
    expect(getUserByEmailSpy).toHaveBeenCalled();
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).toHaveBeenCalledWith(id, { email });
  });
});
