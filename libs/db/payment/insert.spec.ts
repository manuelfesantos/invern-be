import { insertPaymentReturningAll, insertPaymentReturningId } from "./insert";

import * as DB from "@db";
import { paymentsTable } from "@schema";
import { InsertPayment } from "@payment-entity";

const insertPayment: InsertPayment = {
  paymentId: "1",
  state: "succeeded",
  type: "card",
  grossAmount: 100,
};

const payment = {
  ...insertPayment,
  createdAt: "today",
};

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn(),
      }),
    }),
  }),
}));

const FIRST_ELEMENT = 0;

const ONE_ELEMENT = 1;

describe("insertPayment", () => {
  const returningSpy = jest.spyOn(
    DB.db().insert(paymentsTable).values(payment),
    "returning",
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("returning id", () => {
    it("should return id", async () => {
      returningSpy.mockResolvedValueOnce([{ paymentId: "1" }]);
      const result = await insertPaymentReturningId(insertPayment);
      expect(result.length).toBe(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT].paymentId).toBe("1");
    });
  });
  describe("returning all", () => {
    it("should return all", async () => {
      returningSpy.mockResolvedValueOnce([
        { paymentId: "1", amount: 100, state: "succeeded", type: "card" },
      ]);
      const result = await insertPaymentReturningAll(insertPayment);
      expect(result.length).toBe(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual({
        paymentId: "1",
        amount: 100,
        state: "succeeded",
        type: "card",
      });
    });
  });
});
