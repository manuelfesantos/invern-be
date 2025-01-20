import { signup } from "./signup";
import * as UserAdapter from "@user-db";
import { User, userToUserDTO } from "@user-entity";
import { ZodError } from "zod";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";
import * as JwtUtils from "@jwt-utils";
import * as KvAdapter from "@kv-adapter";
import { Cart } from "@cart-entity";

const { id: userId } = userMock;
const { id: cartId } = userMock.cart as Cart;

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@cart-db", () => ({
  insertCart: jest.fn(() => [{ cartId }]),
}));

jest.mock("@user-db", () => ({
  insertUser: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
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
  setAuthSecret: jest.fn(),
}));

const validSignupBodyWithoutRemember = {
  email: "example@example.com",
  password: "example-password",
  firstName: "example",
  lastName: "example",
};

const validSignupBodyWithRemember = {
  email: "example@example.com",
  password: "example-password",
  firstName: "example",
  lastName: "example",
  remember: true,
};

describe("signup", () => {
  const createUserSpy = jest.spyOn(UserAdapter, "insertUser");
  const getUserByEmailSpy = jest.spyOn(UserAdapter, "getUserByEmail");
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  const getLoggedInRefreshTokenSpy = jest.spyOn(
    JwtUtils,
    "getLoggedInRefreshToken",
  );
  const getLoggedInTokenSpy = jest.spyOn(JwtUtils, "getLoggedInToken");
  const setAuthSecretSpy = jest.spyOn(KvAdapter, "setAuthSecret");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call createUser with default remember value when remember is not provided", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(undefined);
    createUserSpy.mockResolvedValueOnce([{ userId }]);
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    getLoggedInRefreshTokenSpy.mockResolvedValueOnce("refreshToken");
    getLoggedInTokenSpy.mockResolvedValueOnce("accessToken");

    const response = await signup(validSignupBodyWithoutRemember);

    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(createUserSpy).toHaveBeenCalledWith({
      ...validSignupBodyWithoutRemember,
      cartId,
      remember: false,
    });
    expect(getLoggedInRefreshTokenSpy).toHaveBeenCalledWith(userId, cartId);
    expect(getLoggedInTokenSpy).toHaveBeenCalledWith(userId, cartId, false);
    expect(setAuthSecretSpy).toHaveBeenCalledWith(userId, "refreshToken");

    const expectedResponse = successResponse.CREATED("user created", {
      user: userToUserDTO(userMock),
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });
  it("should call createUser with provided remember value when remember is provided", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(undefined);
    createUserSpy.mockResolvedValueOnce([{ userId }]);
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    getLoggedInRefreshTokenSpy.mockResolvedValueOnce("refreshToken");
    getLoggedInTokenSpy.mockResolvedValueOnce("accessToken");
    const response = await signup(validSignupBodyWithRemember);
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(createUserSpy).toHaveBeenCalledWith({
      ...validSignupBodyWithRemember,
      cartId,
    });
    expect(getLoggedInRefreshTokenSpy).toHaveBeenCalledWith(userId, cartId);
    expect(getLoggedInTokenSpy).toHaveBeenCalledWith(userId, cartId, true);
    expect(setAuthSecretSpy).toHaveBeenCalledWith(userId, "refreshToken");

    const expectedResponse = successResponse.CREATED("user created", {
      user: userToUserDTO(userMock),
      accessToken: "accessToken",
    });
    await compareResponses(response, expectedResponse);
  });
  it("should throw error if user already exists", async () => {
    getUserByEmailSpy.mockResolvedValueOnce({} as User);
    await expect(
      async () => await signup(validSignupBodyWithoutRemember),
    ).rejects.toEqual(
      expect.objectContaining({
        message: "Email already taken",
        code: 409,
      }),
    );
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if mail is invalid", async () => {
    await expect(
      async () =>
        await signup({ ...validSignupBodyWithoutRemember, email: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if password is invalid", async () => {
    await expect(
      async () =>
        await signup({ ...validSignupBodyWithoutRemember, password: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if firstName is invalid", async () => {
    await expect(
      async () =>
        await signup({ ...validSignupBodyWithoutRemember, firstName: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if lastName is invalid", async () => {
    await expect(
      async () =>
        await signup({ ...validSignupBodyWithoutRemember, lastName: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if user is already signed in", async () => {
    await expect(
      async () => await signup(validSignupBodyWithoutRemember, userId),
    ).rejects.toEqual(
      expect.objectContaining({ message: "already logged in" }),
    );
    expect(getUserByIdSpy).not.toHaveBeenCalled();
  });
});
