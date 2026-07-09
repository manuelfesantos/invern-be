/**
 * Health readiness: reports each dependency's status and flips to "degraded"
 * (→ 503 at the route) when any ping throws. The env bindings are mocked so we
 * drive success/failure per dependency.
 */
const mockFirst = jest.fn();
const mockKvGet = jest.fn();
const mockR2Head = jest.fn();

jest.mock("@env-utils", () => ({
  __esModule: true,
  ENV: {
    INVERN_DB: { prepare: () => ({ first: mockFirst }) },
    AUTH_KV: { get: mockKvGet },
    STOCK_BUCKET: { head: mockR2Head },
  },
}));

import { getHealthStatus } from "../../libs/modules/health/use-cases/get-health-status";

beforeEach(() => {
  mockFirst.mockReset().mockResolvedValue({ 1: 1 });
  mockKvGet.mockReset().mockResolvedValue(null);
  mockR2Head.mockReset().mockResolvedValue(null);
});

describe("getHealthStatus", () => {
  it("reports ok when every dependency is reachable", async () => {
    await expect(getHealthStatus()).resolves.toEqual({
      status: "ok",
      checks: { d1: "ok", kv: "ok", r2: "ok" },
    });
  });

  it("marks the failing dependency error and the whole status degraded", async () => {
    mockKvGet.mockRejectedValue(new Error("KV unreachable"));
    await expect(getHealthStatus()).resolves.toEqual({
      status: "degraded",
      checks: { d1: "ok", kv: "error", r2: "ok" },
    });
  });

  it("degrades when D1 is down", async () => {
    mockFirst.mockRejectedValue(new Error("D1 down"));
    const result = await getHealthStatus();
    expect(result.status).toBe("degraded");
    expect(result.checks.d1).toBe("error");
  });
});
