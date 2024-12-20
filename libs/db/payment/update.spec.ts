import { updatePayment } from "./update";

import * as DB from "@db";
import { paymentsTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              paymentId: "1",
              state: "succeeded",
              type: "card",
              grossAmount: 100,
            },
          ]),
        }),
      }),
    }),
  }),
}));

describe("updatePayment", () => {
  const setSpy = jest.spyOn(DB.db().update(paymentsTable), "set");
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update payment", async () => {
    const paymentId = "1";
    const state = "succeeded";
    const type = "card";
    const grossAmount = 100;
    const result = await updatePayment(paymentId, { state, type, grossAmount });
    expect(result).toEqual([
      {
        paymentId: "1",
        state: "succeeded",
        type: "card",
        grossAmount: 100,
      },
    ]);
    expect(setSpy).toHaveBeenCalledWith({
      state: "succeeded",
      type: "card",
      grossAmount: 100,
    });
  });
});
