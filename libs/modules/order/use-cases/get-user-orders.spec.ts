import { clientOrdersMock, compareResponses } from "@mocks-utils";
import { successResponse } from "@response-entity";
import { getUserOrders } from "./get-user-orders";
import * as OrderDb from "@order-db";

jest.mock("@order-db", () => ({
  getOrdersByUserId: jest.fn(),
}));

jest.mock("@jwt-utils", () => ({
  getTokenCookie: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

const accessToken = "accessToken";
const refreshToken = "refreshToken";
const tokens = { refreshToken, accessToken };

const remember = true;

describe("getUserOrders", () => {
  const getOrdersByUserIdSpy = jest.spyOn(OrderDb, "getOrdersByUserId");
  it("should get user orders", async () => {
    getOrdersByUserIdSpy.mockResolvedValueOnce(clientOrdersMock);
    const userId = "userId";
    const response = await getUserOrders(tokens, remember, userId);
    const expectedResponse = successResponse.OK(
      "success getting orders by user id",
      { accessToken, orders: clientOrdersMock },
    );
    await compareResponses(response, expectedResponse);
  });
  it("should throw error when orders not found", async () => {
    getOrdersByUserIdSpy.mockResolvedValueOnce([]);
    const userId = "userId";
    const response = await getUserOrders(tokens, remember, userId);
    const expectedResponse = successResponse.OK(
      "success getting orders by user id",
      { accessToken, orders: [] },
    );
    expect(getOrdersByUserIdSpy).toHaveBeenCalledWith(userId);
    await compareResponses(response, expectedResponse);
  });
  it("should throw error if getOrdersByUserId throws error", async () => {
    getOrdersByUserIdSpy.mockRejectedValueOnce(new Error("database error"));
    const userId = "userId";
    await expect(
      async () => await getUserOrders(tokens, remember, userId),
    ).rejects.toEqual(expect.objectContaining({ message: "database error" }));
    expect(getOrdersByUserIdSpy).toHaveBeenCalledWith(userId);
  });
});
