import { updateOrder } from "./update";
import * as DB from "@db";
import { ordersTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("updateOrder", () => {
  const setSpy = jest.spyOn(DB.db().update(ordersTable), "set");
  it("should update order", async () => {
    const orderId = "1";
    const changes = {
      paymentId: "1",
    };
    const result = await updateOrder(orderId, changes);
    expect(result).toBeUndefined();
    expect(setSpy).toHaveBeenCalledWith(changes);
  });
});
