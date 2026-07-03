/**
 * Feature 01 / step-04: the /private RBAC middleware rejects anonymous (401)
 * and non-admin (403) callers, admits admins, never rejects preflight, and
 * lets self-gated maintenance routes through.
 *
 * Tokens are minted with the real getLoggedInToken (role-carrying), so the test
 * exercises the true verify/decrypt/decode path via getCredentials.
 */
import { requireAdmin } from "../../functions/private/_middleware";
import { getLoggedInToken } from "@jwt-utils";
import { withTestContext } from "../harness";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CART_ID = "22222222-2222-4222-8222-222222222222";

interface RunResult {
  status: number;
  nextCalled: boolean;
  body: string;
}

const runMiddleware = async (request: Request): Promise<RunResult> => {
  let nextCalled = false;
  const next = async (): Promise<Response> => {
    nextCalled = true;
    return new Response("PASSED", { status: 200 });
  };
  const context = { request, next } as unknown as Parameters<
    typeof requireAdmin
  >[0];
  const response = await requireAdmin(context);
  return { status: response.status, nextCalled, body: await response.text() };
};

const adminRequest = (token: string, path = "http://x/private/products") =>
  new Request(path, {
    headers: { Authorization: `Bearer ${token}`, Cookie: "s_r=present" },
  });

describe("/private RBAC middleware", () => {
  it("anonymous (no tokens) → 401, next not called", async () => {
    const result = await withTestContext(() =>
      runMiddleware(new Request("http://x/private/products")),
    );
    expect(result.status).toBe(401);
    expect(result.nextCalled).toBe(false);
  });

  it("valid USER token → 403, next not called", async () => {
    const result = await withTestContext(async () => {
      const token = await getLoggedInToken(USER_ID, CART_ID, "USER");
      return runMiddleware(adminRequest(token));
    });
    expect(result.status).toBe(403);
    expect(result.nextCalled).toBe(false);
  });

  it("valid ADMIN token → passes through to next()", async () => {
    const result = await withTestContext(async () => {
      const token = await getLoggedInToken(USER_ID, CART_ID, "ADMIN");
      return runMiddleware(adminRequest(token));
    });
    expect(result.nextCalled).toBe(true);
    expect(result.body).toBe("PASSED");
  });

  it("OPTIONS preflight → not rejected (passes through)", async () => {
    const result = await withTestContext(() =>
      runMiddleware(
        new Request("http://x/private/products", { method: "OPTIONS" }),
      ),
    );
    expect(result.nextCalled).toBe(true);
  });

  it("self-gated maintenance route (stock/setup) bypasses RBAC", async () => {
    const result = await withTestContext(() =>
      runMiddleware(
        new Request("http://x/private/stock/setup", { method: "POST" }),
      ),
    );
    expect(result.nextCalled).toBe(true);
  });

  it("expired/* maintenance route bypasses RBAC", async () => {
    const result = await withTestContext(() =>
      runMiddleware(
        new Request("http://x/private/expired/sessions", { method: "DELETE" }),
      ),
    );
    expect(result.nextCalled).toBe(true);
  });
});
