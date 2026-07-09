/**
 * `reserveLineItems` compensation: it decrements D1 stock, then mirrors to the
 * R2/KV stock stores. If the store write fails, it must restore the D1 decrement
 * so the three stores don't desync from a partial reservation. The D1 actions and
 * the stock client are mocked so we drive the failure and assert the compensation.
 */
jest.mock("@product-db", () => ({
  __esModule: true,
  ...jest.requireActual("@product-db"),
  getDecreaseProductsStockAction: jest.fn(),
  getIncreaseProductsStockAction: jest.fn(),
}));
jest.mock("@r2-adapter", () => ({
  __esModule: true,
  ...jest.requireActual("@r2-adapter"),
  stockClient: { updateMany: jest.fn() },
}));

import {
  getDecreaseProductsStockAction,
  getIncreaseProductsStockAction,
} from "@product-db";
import { stockClient } from "@r2-adapter";
import type { LineItem } from "@product-entity";
import { reserveLineItems } from "../../libs/modules/order/use-cases/checkout/reserve-line-items";
import { withTestContext } from "../harness";

const LINE_ITEMS = [{ id: "p1", quantity: 2 }] as unknown as LineItem[];
const DECREASED = [{ id: "p1", stock: 8 }] as unknown as LineItem[];
const RESTORED = [{ id: "p1", stock: 10 }] as unknown as LineItem[];

const decrease = getDecreaseProductsStockAction as jest.Mock;
const increase = getIncreaseProductsStockAction as jest.Mock;
const updateMany = stockClient.updateMany as jest.Mock;

const actionReturning = (value: unknown) => ({ run: () => Promise.resolve(value) });

beforeEach(() => {
  decrease.mockReset().mockReturnValue(actionReturning(DECREASED));
  increase.mockReset().mockReturnValue(actionReturning(RESTORED));
  updateMany.mockReset();
});

describe("reserveLineItems", () => {
  it("decrements D1 then mirrors to the stock stores; no compensation on success", async () => {
    updateMany.mockResolvedValue(undefined);

    await withTestContext(() => reserveLineItems(LINE_ITEMS));

    expect(decrease).toHaveBeenCalledWith(LINE_ITEMS);
    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledWith(DECREASED);
    expect(increase).not.toHaveBeenCalled(); // no compensation
  });

  it("compensates by restoring D1 when the stock-store write fails", async () => {
    // First mirror (of the decrement) fails; the compensating mirror succeeds.
    updateMany
      .mockRejectedValueOnce(new Error("R2 store unavailable"))
      .mockResolvedValueOnce(undefined);

    await expect(
      withTestContext(() => reserveLineItems(LINE_ITEMS)),
    ).resolves.toBeUndefined();

    // D1 restored with the ORIGINAL line items...
    expect(increase).toHaveBeenCalledWith(LINE_ITEMS);
    // ...and the stores re-mirrored with the restored levels.
    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(updateMany).toHaveBeenNthCalledWith(1, DECREASED);
    expect(updateMany).toHaveBeenNthCalledWith(2, RESTORED);
  });
});
