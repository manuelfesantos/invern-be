import { deleteUser } from "./delete-user";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as UserAdapter from "@user-db";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  deleteUser: jest.fn(),
  getUserById: jest.fn(),
}));

describe("deleteUser", () => {
  const deleteUserSpy = jest.spyOn(UserAdapter, "deleteUser");
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should delete user", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const response = await deleteUser(id);
    const expectedResponse = successResponse.OK("success deleting user");
    await compareResponses(response, expectedResponse);
    expect(deleteUserSpy).toHaveBeenCalledWith(userMock.userId);
  });
  it("should throw error when user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    await expect(async () => await deleteUser(id)).rejects.toBeInstanceOf(
      Error,
    );
    expect(deleteUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error when delete user fails", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    deleteUserSpy.mockRejectedValueOnce(new Error("delete user failed"));
    const id = "userId";
    await expect(async () => await deleteUser(id)).rejects.toEqual(
      expect.objectContaining({ message: "delete user failed" }),
    );
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(deleteUserSpy).toHaveBeenCalled();
  });
});
