import { signup } from "./signup";
import * as UserAdapter from "@user-adapter";
import * as CryptoUtils from "@crypto-utils";
import { RolesEnum, User } from "@user-entity";
import { ZodError } from "zod";

const userId = "2f35f18d-027f-4b64-bf1b-dd069c987c28";
const cartId = "a833b7a7-151e-497e-8d5c-81974971c292";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@user-adapter", () => ({
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
}));

jest.mock("@crypto-utils", () => ({
  hashPassword: jest.fn((password: string) => password),
  getRandomUUID: jest.fn(),
}));

const validSignupBody = {
  email: "example@example.com",
  password: "example-password",
  firstName: "example",
  lastName: "example",
};

describe("signup", () => {
  const createUserSpy = jest.spyOn(UserAdapter, "createUser");
  const getUserByEmailSpy = jest.spyOn(UserAdapter, "getUserByEmail");
  const getRandomUUIDSpy = jest.spyOn(CryptoUtils, "getRandomUUID");
  beforeEach(() => {
    getRandomUUIDSpy.mockReturnValue(cartId);
    jest.clearAllMocks();
  });
  it("should call createUser", async () => {
    getRandomUUIDSpy.mockReturnValueOnce(userId);
    getUserByEmailSpy.mockResolvedValueOnce(null);
    const { password } = validSignupBody;
    await signup(validSignupBody);
    expect(getRandomUUIDSpy).toHaveBeenCalled();
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(createUserSpy).toHaveBeenCalledWith({
      ...validSignupBody,
      userId,
      password,
      cart: {
        cartId,
        products: [],
      },
      roles: [RolesEnum.USER],
    });
  });
  it("should throw error if user already exists", async () => {
    getUserByEmailSpy.mockResolvedValueOnce({} as User);
    await expect(async () => await signup(validSignupBody)).rejects.toEqual(
      expect.objectContaining({
        message: "Email already taken",
        code: 409,
      }),
    );
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(getRandomUUIDSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if mail is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, email: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(getRandomUUIDSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if password is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, password: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(getRandomUUIDSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if firstName is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, firstName: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(getRandomUUIDSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if lastName is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, lastName: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(getRandomUUIDSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
});
