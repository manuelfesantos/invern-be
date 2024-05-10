import { login } from "./login";
import * as UserAdapter from "@user-adapter";
import * as CartAdapter from "@cart-adapter";
import { successResponse } from "@response-entity";
import { compareResponses, userDtoMock, userMock } from "@mocks-utils";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-adapter", () => ({
  getUserByEmail: jest.fn(),
}));
jest.mock("@cart-adapter", () => ({
  getCartById: jest.fn(),
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
    getCartByIdSpy.mockResolvedValueOnce(userMock.cart);
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
    expect(getCartByIdSpy).toHaveBeenCalledWith(userMock.cart.cartId);
  });
  it("should throw error if user not found", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(null);
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
    getCartByIdSpy.mockResolvedValueOnce(userMock.cart);
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
