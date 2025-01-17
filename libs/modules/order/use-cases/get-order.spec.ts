import { clientOrderMock, compareResponses } from "@mocks-utils";
import { successResponse } from "@response-entity";
import { getOrder } from "@order-module";
import * as OrderDb from "@order-db";

const orderId = "orderId";

jest.mock("@logger-utils", () => ({
  logger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({}));

jest.mock("@order-db", () => ({
  getOrderById: jest.fn(),
}));

describe("getOrder", () => {
  const getOrderByClientIdSpy = jest.spyOn(OrderDb, "getOrderById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get order", async () => {
    getOrderByClientIdSpy.mockResolvedValueOnce(clientOrderMock);
    const response = await getOrder(orderId);
    const expectedResponse = successResponse.OK(
      "success getting order",
      clientOrderMock,
    );
    await compareResponses(response, expectedResponse);
  });
  it("should throw error if order not found", async () => {
    getOrderByClientIdSpy.mockResolvedValueOnce(undefined);
    await expect(async () => await getOrder(orderId)).rejects.toEqual(
      expect.objectContaining({ message: "Order not found" }),
    );
  });
  it("should throw error if getOrderByClientId throws error", async () => {
    getOrderByClientIdSpy.mockRejectedValueOnce(new Error("Database error"));
    await expect(async () => await getOrder(orderId)).rejects.toEqual(
      expect.objectContaining({ message: "Database error" }),
    );
  });
});
