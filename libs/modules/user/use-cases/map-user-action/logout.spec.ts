import { logout } from "./logout";
import { successResponse } from "@response-entity";
import { compareResponses } from "@mocks-utils";

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

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

describe("logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return success response", async () => {
    const response = await logout(null, "userId");

    const expectedResponse = successResponse.OK("successfully logged out", {
      accessToken: "token",
    });

    await compareResponses(response, expectedResponse);
  });
  it("should thow error if not logged in", async () => {
    await expect(async () => await logout(null)).rejects.toEqual(
      expect.objectContaining({
        message: "not logged in",
        code: 401,
      }),
    );
  });
});
