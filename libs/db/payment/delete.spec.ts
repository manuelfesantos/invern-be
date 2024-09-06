import { deletePayment } from "./delete";
import * as DB from "@db";
import { paymentsTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deletePayment", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  beforeEach(() => {
    deleteSpy.mockClear();
  });
  it("should delete payment", async () => {
    const paymentId = "1";
    await deletePayment(paymentId);
    expect(deleteSpy).toHaveBeenCalledWith(paymentsTable);
  });
});
