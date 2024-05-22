import { signup } from "./signup";
import * as UserAdapter from "@user-db";
import { User, userToUserDTO } from "@user-entity";
import { ZodError } from "zod";
import { compareResponses, userMock } from "@mocks-utils";
import { successResponse } from "@response-entity";

const userId = "2f35f18d-027f-4b64-bf1b-dd069c987c28";

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@cart-db", () => ({
  insertCart: jest.fn(),
}));

jest.mock("@user-db", () => ({
  insertUser: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
}));

jest.mock("@crypto-utils", () => ({
  hashPassword: jest.fn((password: string) => password),
}));

const validSignupBody = {
  email: "example@example.com",
  password: "example-password",
  firstName: "example",
  lastName: "example",
};

describe("signup", () => {
  const createUserSpy = jest.spyOn(UserAdapter, "insertUser");
  const getUserByEmailSpy = jest.spyOn(UserAdapter, "getUserByEmail");
  const getUserByIdSpy = jest.spyOn(UserAdapter, "getUserById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call createUser", async () => {
    getUserByEmailSpy.mockResolvedValueOnce(undefined);
    createUserSpy.mockResolvedValueOnce([{ userId }]);
    getUserByIdSpy.mockResolvedValueOnce(userMock);
    const response = await signup(validSignupBody);
    expect(getUserByEmailSpy).toHaveBeenCalledWith("example@example.com");
    expect(createUserSpy).toHaveBeenCalledWith(validSignupBody);
    const expectedResponse = successResponse.CREATED(
      "user created",
      userToUserDTO(userMock),
    );
    await compareResponses(response, expectedResponse);
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
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if mail is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, email: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if password is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, password: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if firstName is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, firstName: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
  it("should throw error if lastName is invalid", async () => {
    await expect(
      async () => await signup({ ...validSignupBody, lastName: "" }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(getUserByEmailSpy).not.toHaveBeenCalled();
    expect(createUserSpy).not.toHaveBeenCalled();
  });
});
