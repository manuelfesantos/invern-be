import { login } from "./login";
import * as UserAdapter from "@user-db";
import * as CartAdapter from "@cart-db";
import { successResponse } from "@response-entity";
import { compareResponses, userDtoMock, userMock } from "@mocks-utils";

jest.mock("@cart-db", () => ({
  getCartById: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  getUserByEmail: jest.fn(),
}));
jest.mock("@crypto-utils", () => ({
  hashPassword: jest.fn((password: string) => password),
}));

describe("login", () => {
  const getUserByEmailSpy = jest.spyOn(UserAdapter, "getUserByEmail");
  const getCartByIdSpy = jest.spyOn(CartAdapter, "getCartById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should login successfully", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(userMock);
    const response = await login({
      email: "example@example.com",
      password: "password",
    });
    const expectedResponse = successResponse.OK(
      "successfully logged in",
      userDtoMock,
    );
    await compareResponses(response, expectedResponse);
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
  });
  it("should throw error if user not found", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(undefined);
    await expect(
      async () =>
        await login({
          email: "example@example.com",
          password: "password",
        }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Invalid username or password",
        code: 401,
      }),
    );
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(getCartByIdSpy).not.toHaveBeenCalled();
  });
  it("should throw error if password is incorrect", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(userMock);
    await expect(
      async () =>
        await login({
          email: "example@example.com",
          password: "incorrect-password",
        }),
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Invalid username or password",
        code: 401,
      }),
    );
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(getCartByIdSpy).not.toHaveBeenCalled();
  });
});
