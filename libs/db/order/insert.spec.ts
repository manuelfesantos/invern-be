import { insertOrder } from "./insert";
import * as DB from "@db";
import { ordersTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            orderId: "orderId",
          },
        ]),
      }),
    }),
  }),
}));

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn(() => ({
    info: jest.fn(),
  })),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("insertOrder", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(ordersTable), "values");
  it("should insert order", async () => {
    const order = {
      id: "orderId",
      stripeId: "1",
      userId: "1",
      addressId: "1",
      paymentId: "1",
      snapshot: null,
    };
    const result = await insertOrder(order);
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT]).toEqual({
      orderId: "orderId",
    });
    expect(valuesSpy).toHaveBeenCalled();
  });
});
