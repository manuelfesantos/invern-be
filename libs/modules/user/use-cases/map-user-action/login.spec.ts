import { login } from "./login";
import * as UserAdapter from "@user-db";
import * as CartAdapter from "@cart-db";
import { successResponse } from "@response-entity";
import { compareResponses, userDtoMock, userMock } from "@mocks-utils";
import { Cart } from "@cart-entity";
import * as JwtUtils from "@jwt-utils";
import * as KvAdapter from "@kv-adapter";

jest.mock("@cart-db", () => ({
  getCartById: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@user-db", () => ({
  getUserByEmail: jest.fn(),
}));

jest.mock("@crypto-utils", () => ({
  hashPassword: jest.fn((password: string) => password),
}));

jest.mock("@jwt-utils", () => ({
  getLoggedInRefreshToken: jest.fn(),
  getLoggedInToken: jest.fn(),
  getTokenCookie: jest.fn(),
}));

jest.mock("@kv-adapter", () => ({
  getAuthSecret: jest.fn(),
  setAuthSecret: jest.fn(),
}));

const { id: userId } = userMock;
const { id: cartId } = userMock.cart as Cart;

describe("login", () => {
  const getUserByEmailSpy = jest.spyOn(UserAdapter, "getUserByEmail");
  const getCartByIdSpy = jest.spyOn(CartAdapter, "getCartById");
  const getLoggedInRefreshTokenSpy = jest.spyOn(
    JwtUtils,
    "getLoggedInRefreshToken",
  );
  const getLoggedInTokenSpy = jest.spyOn(JwtUtils, "getLoggedInToken");
  const setAuthSecretSpy = jest.spyOn(KvAdapter, "setAuthSecret");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should login successfully", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(userMock);

    getLoggedInRefreshTokenSpy.mockResolvedValueOnce("refreshToken");
    getLoggedInTokenSpy.mockResolvedValueOnce("accessToken");

    const response = await login({
      email: "example@example.com",
      password: "password",
    });

    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");

    expect(getLoggedInRefreshTokenSpy).toHaveBeenCalledWith(userId, cartId);
    expect(getLoggedInTokenSpy).toHaveBeenCalledWith(userId, cartId, false);
    expect(setAuthSecretSpy).toHaveBeenCalledWith(userId, "refreshToken");

    const expectedResponse = successResponse.OK("successfully logged in", {
      user: userDtoMock,
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });
  it("should throw error if user is already logged in", async () => {
    await expect(
      async () =>
        await login(
          {
            email: "example@example.com",
            password: "password",
          },
          userId,
        ),
    ).rejects.toEqual(
      expect.objectContaining({
        message: "already logged in",
        code: 401,
      }),
    );
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
