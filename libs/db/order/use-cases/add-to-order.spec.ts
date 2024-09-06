import { addToOrder } from "@order-db";

import * as DB from "@db";
import { ordersTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn(),
    }),
  }),
}));

describe("addToOrder", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(ordersTable), "values");
  it("should add to order", async () => {
    const products = [
      {
        productId: "1",
        quantity: 1,
      },
    ];
    const orderId = "1";
    const result = await addToOrder(products, orderId);
    expect(result).toBeUndefined();
    expect(valuesSpy).toHaveBeenCalledWith([
      {
        orderId,
        productId: "1",
        quantity: 1,
      },
    ]);
  });
});
