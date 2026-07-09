/**
 * Branch coverage for the cart stock/quantity operations. `runBatchOperation`
 * (the D1 batch) is mocked so we drive the exact DB-result shapes and assert the
 * validation branches — no real database.
 */
jest.mock("@generics-db", () => ({
  __esModule: true,
  ...jest.requireActual("@generics-db"),
  runBatchOperation: jest.fn(),
}));

import { runBatchOperation } from "@generics-db";
import { selectProductStockAndQuantityOperation } from "../../libs/modules/cart/use-cases/operations/select-product-stock-and-quantity";
import { upsertProductQuantityOperation } from "../../libs/modules/cart/use-cases/operations/upsert-product-quantity";

const mockRun = runBatchOperation as unknown as jest.Mock;

const PRODUCT = "11111111-1111-4111-8111-111111111111";
const CART = "22222222-2222-4222-8222-222222222222";

beforeEach(() => mockRun.mockReset());

describe("selectProductStockAndQuantityOperation", () => {
  it("returns stock + quantity when the product exists", async () => {
    mockRun.mockResolvedValue([5, 2]);
    await expect(
      selectProductStockAndQuantityOperation(PRODUCT, CART),
    ).resolves.toEqual({ stock: 5, quantity: 2 });
  });

  it("defaults quantity to 0 when the product is not yet in the cart", async () => {
    mockRun.mockResolvedValue([5, undefined]);
    await expect(
      selectProductStockAndQuantityOperation(PRODUCT, CART),
    ).resolves.toEqual({ stock: 5, quantity: 0 });
  });

  it("treats stock 0 as a valid (in-stock-record) result, not not-found", async () => {
    mockRun.mockResolvedValue([0, 0]);
    await expect(
      selectProductStockAndQuantityOperation(PRODUCT, CART),
    ).resolves.toEqual({ stock: 0, quantity: 0 });
  });

  it("throws PRODUCT_NOT_FOUND when the stock record is undefined", async () => {
    mockRun.mockResolvedValue([undefined, 1]);
    await expect(
      selectProductStockAndQuantityOperation(PRODUCT, CART),
    ).rejects.toThrow();
  });
});

describe("upsertProductQuantityOperation", () => {
  it("returns the cart after upserting the quantity", async () => {
    const cart = { id: CART, products: [] };
    mockRun.mockResolvedValue([undefined, cart]);
    await expect(
      upsertProductQuantityOperation(PRODUCT, CART, 3),
    ).resolves.toBe(cart);
  });

  it("throws CART_NOT_FOUND when the cart is missing after upsert", async () => {
    mockRun.mockResolvedValue([undefined, undefined]);
    await expect(
      upsertProductQuantityOperation(PRODUCT, CART, 3),
    ).rejects.toThrow();
  });
});
