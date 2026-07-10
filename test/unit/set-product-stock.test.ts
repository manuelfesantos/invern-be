/**
 * The stock write-through use-case: D1 is written first (canonical + the source
 * /stock/setup resyncs from), then KV/R2 via the locked stockClient. DB actions
 * and the R2 client are mocked so we assert the ordering/args without real IO.
 */
jest.mock("@product-db", () => ({
  __esModule: true,
  getSelectProductByIdAction: jest.fn(),
  getUpdateProductAction: jest.fn(),
}));
jest.mock("@r2-adapter", () => ({
  __esModule: true,
  stockClient: { updateMany: jest.fn() },
}));

import { getSelectProductByIdAction, getUpdateProductAction } from "@product-db";
import { stockClient } from "@r2-adapter";
import { setProductStock } from "../../libs/modules/product/use-cases/set-product-stock";

const selectMock = getSelectProductByIdAction as unknown as jest.Mock;
const updateMock = getUpdateProductAction as unknown as jest.Mock;
const updateMany = stockClient.updateMany as unknown as jest.Mock;

const PID = "2fef20d6-4fa9-461a-8acb-ba87c3e15c5e";

beforeEach(() => jest.clearAllMocks());

describe("setProductStock", () => {
  it("writes D1 then propagates to KV/R2 and returns the new stock", async () => {
    const order: string[] = [];
    selectMock.mockReturnValue({ run: jest.fn().mockResolvedValue({ id: PID }) });
    updateMock.mockReturnValue({
      run: jest.fn().mockImplementation(async () => {
        order.push("d1");
      }),
    });
    updateMany.mockImplementation(async () => {
      order.push("kv-r2");
    });

    await expect(setProductStock(PID, 7)).resolves.toEqual({
      id: PID,
      stock: 7,
    });
    expect(updateMock).toHaveBeenCalledWith(PID, { stock: 7 });
    expect(updateMany).toHaveBeenCalledWith([{ id: PID, stock: 7 }]);
    expect(order).toEqual(["d1", "kv-r2"]); // D1 before KV/R2
  });

  it("throws when the product does not exist and writes nothing", async () => {
    selectMock.mockReturnValue({
      run: jest.fn().mockResolvedValue(undefined),
    });

    await expect(setProductStock(PID, 7)).rejects.toThrow();
    expect(updateMock).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
});
