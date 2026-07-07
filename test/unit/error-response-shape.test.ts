import { errorResponse, prepareError } from "@response-entity";
import { withTestContext } from "../harness";

const bodyOf = async (res: Response): Promise<Record<string, unknown>> =>
  (await res.json()) as Record<string, unknown>;

describe("error response shape", () => {
  it("never leaks name/stack/cause for a no-arg (default) error", async () => {
    const res = await withTestContext(async () => errorResponse.FORBIDDEN());
    const body = await bodyOf(res);

    expect(res.status).toBe(403);
    expect(body).toEqual({ issues: ["forbidden"] });
    expect(body).not.toHaveProperty("stack");
    expect(body).not.toHaveProperty("name");
    expect(body).not.toHaveProperty("cause");
  });

  it("does not leak the stack when handed a full SimpleError", async () => {
    const res = await withTestContext(async () =>
      // prepareError produces { name, cause, stack, message }
      errorResponse.INTERNAL_SERVER_ERROR(prepareError("boom")),
    );
    const body = await bodyOf(res);

    expect(body).toEqual({ issues: ["boom"] });
    expect(JSON.stringify(body)).not.toContain("stack");
  });

  it("wraps a bare string into the issues shape", async () => {
    const res = await withTestContext(async () =>
      errorResponse.BAD_REQUEST("productId is required"),
    );
    const body = await bodyOf(res);

    expect(res.status).toBe(400);
    expect(body).toEqual({ issues: ["productId is required"] });
  });

  it("passes an already-shaped issues body through untouched", async () => {
    const res = await withTestContext(async () =>
      errorResponse.BAD_REQUEST({ issues: ["a", "b"] }),
    );
    const body = await bodyOf(res);

    expect(body).toEqual({ issues: ["a", "b"] });
  });
});
