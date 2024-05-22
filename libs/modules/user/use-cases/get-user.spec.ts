import { getUser } from "./get-user";
import * as UserAdapter from "@user-db";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import { userToUserDTO } from "@user-entity";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  getUserById: jest.fn(),
}));

describe("getUser", () => {
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get user", async () => {
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const id = "userId";
    const response = await getUser(id);
    const expectedResponse = successResponse.OK(
      "success getting user",
      userToUserDTO(userMock),
    );
    await compareResponses(response, expectedResponse);
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
  });
  it("should throw error when user not found", async () => {
    getUserByIdSpy.mockRejectedValueOnce(new Error("user not found"));
    const id = "userId";
    await expect(async () => await getUser(id)).rejects.toEqual(
      expect.objectContaining({ message: "user not found" }),
    );
    expect(getUserByIdSpy).toHaveBeenCalledWith(id);
  });
});
