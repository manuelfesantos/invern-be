import { getPaymentById } from "./select";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      paymentsTable: {
        findFirst: jest.fn().mockReturnValue({
          paymentId: "1",
          state: "succeeded",
          type: "card",
          amount: 100,
        }),
      },
    },
  }),
}));

describe("getPayment by id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get payment by id", async () => {
    const paymentId = "1";
    const result = await getPaymentById(paymentId);
    expect(result).toEqual({
      paymentId: "1",
      state: "succeeded",
      type: "card",
      amount: 100,
    });
  });
});
