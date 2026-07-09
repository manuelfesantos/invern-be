/**
 * Dashboard summary: shapes the batched aggregate results into the payload and
 * coerces the nullable `isCanceled` to a definite boolean. The batch runner is
 * mocked so we assert the shaping, not the DB.
 */
jest.mock("@generics-db", () => ({
  __esModule: true,
  ...jest.requireActual("@generics-db"),
  runBatchOperation: jest.fn(),
}));

import { runBatchOperation } from "@generics-db";
import { getDashboardSummary } from "../../libs/modules/dashboard/use-cases/get-dashboard-summary";

const batch = runBatchOperation as unknown as jest.Mock;

beforeEach(() => batch.mockReset());

describe("getDashboardSummary", () => {
  it("maps the six batched results into the summary payload", async () => {
    const lowStock = [{ id: "p1", name: "Earth Jar", stock: 2 }];
    const recentOrders = [
      { id: "o1", createdAt: "2026-02-01T00:00:00.000", isCanceled: 1 },
      { id: "o2", createdAt: "2026-01-01T00:00:00.000", isCanceled: null },
    ];
    batch.mockResolvedValue([7, 12, 4, 3, lowStock, recentOrders]);

    const summary = await getDashboardSummary();

    expect(summary.counts).toEqual({
      orders: 7,
      products: 12,
      users: 4,
      collections: 3,
    });
    expect(summary.lowStock).toEqual(lowStock);
    // nullable / truthy isCanceled coerced to a definite boolean
    expect(summary.recentOrders).toEqual([
      { id: "o1", createdAt: "2026-02-01T00:00:00.000", isCanceled: true },
      { id: "o2", createdAt: "2026-01-01T00:00:00.000", isCanceled: false },
    ]);
  });

  it("runs every aggregate in a single batch (one round-trip)", async () => {
    batch.mockResolvedValue([0, 0, 0, 0, [], []]);
    await getDashboardSummary();
    expect(batch).toHaveBeenCalledTimes(1);
    expect(batch.mock.calls[0]).toHaveLength(6); // 4 counts + 2 selects
  });
});
