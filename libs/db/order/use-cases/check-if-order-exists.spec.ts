import { checkIfOrderExists } from "@order-db";

import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      ordersTable: {
        findFirst: jest.fn(),
      },
    },
  }),
}));

describe("checkIfOrderExists", () => {
  const findFirstSpy = jest.spyOn(DB.db().query.ordersTable, "findFirst");
  beforeEach(() => {
    findFirstSpy.mockClear();
  });
  it("should check if order exists", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findFirstSpy.mockReturnValue({ orderId: "1" } as any);
    const orderId = "1";
    const result = await checkIfOrderExists(orderId);
    expect(result).toBe(true);
  });

  it("should not check if order exists", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findFirstSpy.mockReturnValue(undefined as any);
    const orderId = "1";
    const result = await checkIfOrderExists(orderId);
    expect(result).toBe(false);
  });
});
