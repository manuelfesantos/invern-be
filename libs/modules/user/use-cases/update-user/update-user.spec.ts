import { updateUser } from "./update-user";
import * as UpdateEmail from "./update-email";
import * as UpdatePassword from "./update-password";
import * as UpdateName from "./update-name";
import { successResponse } from "@response-entity";
import { compareResponses, userMock } from "@mocks-utils";
import { ZodError } from "zod";

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("./update-email", () => ({
  updateEmail: jest.fn(),
}));

jest.mock("./update-password", () => ({
  updatePassword: jest.fn(),
}));

jest.mock("./update-name", () => ({
  updateName: jest.fn(),
}));

jest.mock("@user-db", () => ({
  incrementUserVersion: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({
  getAnonymousTokens: jest.fn(() => ({
    token: "token",
    refreshToken: "refreshToken",
  })),
  getTokenCookie: jest.fn(),
}));

jest.mock("@kv-adapter", () => ({
  setAuthSecret: jest.fn(),
}));

const tokens = {
  refreshToken: "refreshToken",
  accessToken: "accessToken",
};

const remember = true;

describe("updateUser", () => {
  const updateNameSpy = jest.spyOn(UpdateName, "updateName");
  const updateEmailSpy = jest.spyOn(UpdateEmail, "updateEmail");
  const updatePasswordSpy = jest.spyOn(UpdatePassword, "updatePassword");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should update mail when action is 'update-mail'", async () => {
    updateEmailSpy.mockResolvedValueOnce(
      successResponse.OK("user mail updated", {
        ...userMock,
        email: "email",
      }),
    );
    const id = "userId";
    const body = { email: "email" };
    const action = "update-email";
    const response = await updateUser(tokens, remember, body, action, id);
    const expectedResponse = successResponse.OK("user mail updated", {
      ...userMock,
      email: "email",
    });
    await compareResponses(response, expectedResponse);
    expect(updateEmailSpy).toHaveBeenCalled();
    expect(updateNameSpy).not.toHaveBeenCalled();
    expect(updatePasswordSpy).not.toHaveBeenCalled();
  });
  it("should update name when action is 'update-name'", async () => {
    updateNameSpy.mockResolvedValueOnce(
      successResponse.OK("user name updated", {
        ...userMock,
        firstName: "firstName",
        lastName: "lastName",
      }),
    );
    const id = "userId";
    const body = { firstName: "firstName", lastName: "lastName" };
    const action = "update-name";
    const response = await updateUser(tokens, remember, body, action, id);
    const expectedResponse = successResponse.OK("user name updated", {
      ...userMock,
      firstName: "firstName",
      lastName: "lastName",
    });
    await compareResponses(response, expectedResponse);
    expect(updateNameSpy).toHaveBeenCalled();
    expect(updateEmailSpy).not.toHaveBeenCalled();
    expect(updatePasswordSpy).not.toHaveBeenCalled();
  });
  it("should update password when action is 'update-password'", async () => {
    updatePasswordSpy.mockResolvedValueOnce(
      successResponse.OK("user password updated", userMock),
    );
    const id = "userId";
    const body = { password: "password" };
    const action = "update-password";
    const response = await updateUser(tokens, remember, body, action, id);
    const expectedResponse = successResponse.OK(
      "user password updated",
      userMock,
    );
    await compareResponses(response, expectedResponse);
    expect(updatePasswordSpy).toHaveBeenCalled();
    expect(updateNameSpy).not.toHaveBeenCalled();
    expect(updateEmailSpy).not.toHaveBeenCalled();
  });
  it("should throw error if action is invalid", async () => {
    const id = "userId";
    const body = { password: "password" };
    const action = "invalid-action";
    await expect(
      async () => await updateUser(tokens, remember, body, action, id),
    ).rejects.toBeInstanceOf(ZodError);
    expect(updateEmailSpy).not.toHaveBeenCalled();
    expect(updateNameSpy).not.toHaveBeenCalled();
    expect(updatePasswordSpy).not.toHaveBeenCalled();
  });
  it("should throw error if user is not logged in", async () => {
    const body = { password: "password" };
    const action = "update-email";
    await expect(
      async () => await updateUser(tokens, remember, body, action),
    ).rejects.toEqual(expect.objectContaining({ message: "not logged in" }));
    expect(updateEmailSpy).not.toHaveBeenCalled();
  });
  it("should throw error if action is not provided", async () => {
    const id = "userId";
    const body = { password: "password" };
    await expect(
      async () => await updateUser(tokens, remember, body, null, id),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Action is required", code: 400 }),
    );
    expect(updateEmailSpy).not.toHaveBeenCalled();
    expect(updateNameSpy).not.toHaveBeenCalled();
    expect(updatePasswordSpy).not.toHaveBeenCalled();
  });
  it("should throw an error if any update fails", async () => {
    const id = "userId";
    const body = { password: "password" };
    const action = "update-email";
    updateEmailSpy.mockRejectedValueOnce(new Error("Error"));
    await expect(
      async () => await updateUser(tokens, remember, body, action, id),
    ).rejects.toEqual(expect.objectContaining({ message: "Error" }));
    expect(updateEmailSpy).toHaveBeenCalled();
    expect(updateNameSpy).not.toHaveBeenCalled();
    expect(updatePasswordSpy).not.toHaveBeenCalled();
  });
});
