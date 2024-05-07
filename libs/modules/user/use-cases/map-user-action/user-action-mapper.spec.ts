import { userActionMapper } from "./user-action-mapper";
import * as Login from "./login";
import * as Signup from "./signup";
import { ZodError } from "zod";

jest.mock("./login", () => ({
  login: jest.fn(),
}));

jest.mock("./signup", () => ({
  signup: jest.fn(),
}));

describe("loginSignupMapper", () => {
  const loginSpy = jest.spyOn(Login, "login");
  const signupSpy = jest.spyOn(Signup, "signup");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should throw error if action is not provided", async () => {
    await expect(
      async () => await userActionMapper({}, null),
    ).rejects.toBeInstanceOf(ZodError);
    expect(loginSpy).not.toHaveBeenCalled();
    expect(signupSpy).not.toHaveBeenCalled();
  });
  it("should call login if action is login", async () => {
    await userActionMapper({}, "login");
    expect(loginSpy).toHaveBeenCalled();
    expect(signupSpy).not.toHaveBeenCalled();
  });
  it("should call signup if action is signup", async () => {
    await userActionMapper({}, "signup");
    expect(loginSpy).not.toHaveBeenCalled();
    expect(signupSpy).toHaveBeenCalled();
  });
  it("should throw error if action is invalid", async () => {
    await expect(
      async () => await userActionMapper({}, "invalid-action"),
    ).rejects.toBeInstanceOf(ZodError);
    expect(loginSpy).not.toHaveBeenCalled();
    expect(signupSpy).not.toHaveBeenCalled();
  });
});
