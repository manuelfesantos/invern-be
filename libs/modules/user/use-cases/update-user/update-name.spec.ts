import { updateName } from "./update-name";
import { successResponse } from "@response-entity";
import { compareResponses, userMock } from "@mocks-utils";
import * as UserAdapter from "@user-adapter";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-adapter", () => ({
  updateUser: jest.fn(),
  getUserById: jest.fn(),
}));

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
    const response = await updateName(id, { firstName, lastName });
    const expectedResponse = successResponse.OK("user name updated", {
      ...userMock,
      firstName,
      lastName,
      password: undefined,
      roles: undefined,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should update only first name", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const firstName = "newFirstName";
    const response = await updateName(id, { firstName });
    const expectedResponse = successResponse.OK("user name updated", {
      ...userMock,
      firstName,
      password: undefined,
      roles: undefined,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should update only last name", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const lastName = "newLastName";
    const response = await updateName(id, { lastName });
    const expectedResponse = successResponse.OK("user name updated", {
      ...userMock,
      lastName,
      password: undefined,
      roles: undefined,
    });
    await compareResponses(response, expectedResponse);
  });
  it("should throw error if neither first name or last name is provided", async () => {
    const id = "userId";
    await expect(async () => await updateName(id, {})).rejects.toBeInstanceOf(
      ZodError,
    );
    expect(updateUserSpy).not.toHaveBeenCalled();
    expect(getUserByIdSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    const firstName = "newFirstName";
    const lastName = "newLastName";
    await expect(
      async () => await updateName(id, { firstName, lastName }),
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
      async () => await updateName(id, { firstName, lastName }),
    ).rejects.toEqual(expect.objectContaining({ message: "update failed" }));
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
    expect(updateUserSpy).toHaveBeenCalledWith(
      id,
      `firstName = '${firstName}', lastName = '${lastName}'`,
    );
  });
});
