import { loginSignupMapper } from "./login-signup-mapper";
import { errors } from "@error-handling-utils";
import * as Login from "./login";
import * as Signup from "./signup";

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
    await expect(async () => await loginSignupMapper({}, null)).rejects.toEqual(
      errors.ACTION_IS_REQUIRED(),
    );
    expect(loginSpy).not.toHaveBeenCalled();
    expect(signupSpy).not.toHaveBeenCalled();
  });
  it("should call login if action is login", async () => {
    await loginSignupMapper({}, "login");
    expect(loginSpy).toHaveBeenCalled();
    expect(signupSpy).not.toHaveBeenCalled();
  });
  it("should call signup if action is signup", async () => {
    await loginSignupMapper({}, "signup");
    expect(loginSpy).not.toHaveBeenCalled();
    expect(signupSpy).toHaveBeenCalled();
  });
  it("should throw error if action is invalid", async () => {
    await expect(
      async () => await loginSignupMapper({}, "invalid-action"),
    ).rejects.toEqual(errors.INVALID_ACTION("invalid-action"));
    expect(loginSpy).not.toHaveBeenCalled();
    expect(signupSpy).not.toHaveBeenCalled();
  });
});
