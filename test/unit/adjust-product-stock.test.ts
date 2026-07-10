/**
 * Admin stock adjustment by signed delta (never absolute — so it composes with
 * checkout reservations). DB actions + R2 client mocked to assert which atomic
 * path runs, the guard, and the write-through mirror.
 */
jest.mock("@product-db", () => ({
  __esModule: true,
  getSelectProductByIdAction: jest.fn(),
  getIncreaseProductsStockAction: jest.fn(),
  getDecreaseProductsStockAction: jest.fn(),
}));
jest.mock("@r2-adapter", () => ({
  __esModule: true,
  stockClient: { updateMany: jest.fn() },
}));

import {
  getDecreaseProductsStockAction,
  getIncreaseProductsStockAction,
  getSelectProductByIdAction,
} from "@product-db";
import { stockClient } from "@r2-adapter";
import { adjustProductStock } from "../../libs/modules/product/use-cases/adjust-product-stock";

const selectMock = getSelectProductByIdAction as unknown as jest.Mock;
const incMock = getIncreaseProductsStockAction as unknown as jest.Mock;
const decMock = getDecreaseProductsStockAction as unknown as jest.Mock;
const updateMany = stockClient.updateMany as unknown as jest.Mock;

const PID = "2fef20d6-4fa9-461a-8acb-ba87c3e15c5e";
const runResolving = (value: unknown) => ({
  run: jest.fn().mockResolvedValue(value),
});

beforeEach(() => jest.clearAllMocks());

describe("adjustProductStock", () => {
  it("adds stock via the atomic increment and mirrors the result", async () => {
    selectMock.mockReturnValue(runResolving({ id: PID, stock: 10 }));
    incMock.mockReturnValue(runResolving([{ id: PID, stock: 15 }]));

    await expect(adjustProductStock(PID, 5)).resolves.toEqual({
      id: PID,
      stock: 15,
    });
    expect(incMock).toHaveBeenCalledWith([{ id: PID, quantity: 5 }]);
    expect(decMock).not.toHaveBeenCalled();
    expect(updateMany).toHaveBeenCalledWith([{ id: PID, stock: 15 }]);
  });

  it("removes stock via the guarded decrement when enough is available", async () => {
    selectMock.mockReturnValue(runResolving({ id: PID, stock: 10 }));
    decMock.mockReturnValue(runResolving([{ id: PID, stock: 7 }]));

    await expect(adjustProductStock(PID, -3)).resolves.toEqual({
      id: PID,
      stock: 7,
    });
    expect(decMock).toHaveBeenCalledWith([{ id: PID, quantity: 3 }]);
    expect(incMock).not.toHaveBeenCalled();
    expect(updateMany).toHaveBeenCalledWith([{ id: PID, stock: 7 }]);
  });

  it("rejects removing more than is in stock and writes nothing", async () => {
    selectMock.mockReturnValue(runResolving({ id: PID, stock: 2 }));

    await expect(adjustProductStock(PID, -5)).rejects.toThrow();
    expect(decMock).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("throws when the product does not exist and writes nothing", async () => {
    selectMock.mockReturnValue(runResolving(undefined));

    await expect(adjustProductStock(PID, 5)).rejects.toThrow();
    expect(incMock).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
});
