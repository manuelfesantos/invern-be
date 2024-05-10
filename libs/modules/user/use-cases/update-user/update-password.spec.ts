import { updatePassword } from "./update-password";
import * as UserAdapter from "@user-adapter";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-adapter", () => ({
  getUserById: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock("@crypto-utils", () => ({
  hashPassword: jest.fn((password: string) => password),
}));

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
    const response = await updatePassword(id, { password });
    const expectedResponse = successResponse.OK("user password updated", {
      ...userMock,
      password: undefined,
      roles: undefined,
    });
    await compareResponses(response, expectedResponse);
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).toHaveBeenCalledWith(id, `password = '${password}'`);
  });
  it("should throw error if password is invalid", async () => {
    const id = "userId";
    const password = "";
    await expect(
      async () => await updatePassword(id, { password }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByIdSpy).not.toHaveBeenCalled();
    expect(updateUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    const password = "newPassword";
    await expect(
      async () => await updatePassword(id, { password }),
    ).rejects.toEqual(expect.objectContaining({ message: "user not found" }));
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).not.toHaveBeenCalled();
  });
});
