import { Hono } from "hono";
import type Env from "@env-entity";
import type { RateLimit } from "@env-entity";
import { rateLimitByEmail } from "../../apps/backend/src/middleware/rate-limit";
import { withTestContext } from "../harness";

/**
 * Unit-tests the rate-limit middleware's wiring: threshold breach → 429, key
 * derivation, and skip-when-no-email. The counter's window/reset itself is the
 * Cloudflare Rate Limiting binding (runtime infra), not this code, so it's
 * exercised against the live binding under `wrangler dev`, not here.
 */
const makeLimiter = (
  results: boolean[],
): RateLimit & { keys: string[] } => {
  const keys: string[] = [];
  let i = 0;
  return {
    keys,
    limit: async ({ key }) => {
      keys.push(key);
      return { success: results[i++] ?? true };
    },
  };
};

const post = (limiter: RateLimit, body: unknown, raw = false) => {
  const app = new Hono<{ Bindings: Env }>();
  app.post("/login", rateLimitByEmail("LOGIN_RATE_LIMITER"), (c) =>
    c.json({ handled: true }),
  );
  // The error path (429) builds its body via the ALS logger, so run within a
  // test context the way the app's bootstrap middleware would.
  return withTestContext(() =>
    app.request(
      "/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw ? (body as string) : JSON.stringify(body),
      },
      { LOGIN_RATE_LIMITER: limiter } as unknown as Env,
    ),
  );
};

describe("rateLimitByEmail middleware", () => {
  it("allows the request when under the limit", async () => {
    const limiter = makeLimiter([true]);
    const res = await post(limiter, { email: "a@b.com", password: "x" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ handled: true });
  });

  it("returns a sanitized 429 and skips the handler when over the limit", async () => {
    const limiter = makeLimiter([false]);
    const res = await post(limiter, { email: "a@b.com", password: "x" });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ issues: ["too many requests"] });
  });

  it("keys per email, normalized (trim + lowercase)", async () => {
    const limiter = makeLimiter([true]);
    await post(limiter, { email: "  User@Example.COM  ", password: "x" });
    expect(limiter.keys).toEqual(["LOGIN_RATE_LIMITER:user@example.com"]);
  });

  it("does not consume the body — the handler can still read it", async () => {
    const limiter = makeLimiter([true]);
    const app = new Hono<{ Bindings: Env }>();
    app.post("/login", rateLimitByEmail("LOGIN_RATE_LIMITER"), async (c) =>
      c.json(await c.req.raw.json()),
    );
    const res = await withTestContext(() =>
      app.request(
        "/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "a@b.com", password: "secret" }),
        },
        { LOGIN_RATE_LIMITER: limiter } as unknown as Env,
      ),
    );
    expect(await res.json()).toEqual({ email: "a@b.com", password: "secret" });
  });

  it("skips the limiter when the body has no email (handler validates instead)", async () => {
    const limiter = makeLimiter([false]); // would 429 if called
    const res = await post(limiter, { password: "x" });
    expect(limiter.keys).toEqual([]);
    expect(res.status).toBe(200);
  });

  it("skips the limiter on a non-JSON body", async () => {
    const limiter = makeLimiter([false]);
    const res = await post(limiter, "not json", true);
    expect(limiter.keys).toEqual([]);
    expect(res.status).toBe(200);
  });
});
