import { ENV } from "@env-utils";

type CheckResult = "ok" | "error";

export interface HealthStatus {
  status: "ok" | "degraded";
  checks: {
    d1: CheckResult;
    kv: CheckResult;
    r2: CheckResult;
  };
}

/** Runs `fn`, reporting "ok" on success and "error" on any throw. */
const ping = async (fn: () => Promise<unknown>): Promise<CheckResult> => {
  try {
    await fn();
    return "ok";
  } catch {
    return "error";
  }
};

/**
 * Readiness check: cheaply pings each backing service (D1, KV, R2) in parallel.
 * `status` is "degraded" if any dependency is unreachable — the route maps that
 * to a 503 so uptime monitoring detects it.
 */
export const getHealthStatus = async (): Promise<HealthStatus> => {
  const [d1, kv, r2] = await Promise.all([
    ping(() => ENV.INVERN_DB.prepare("SELECT 1").first()),
    ping(() => ENV.AUTH_KV.get("__health__")),
    ping(() => ENV.STOCK_BUCKET.head("__health__")),
  ]);

  const checks = { d1, kv, r2 };
  const status = Object.values(checks).every((c) => c === "ok")
    ? "ok"
    : "degraded";

  return { status, checks };
};
