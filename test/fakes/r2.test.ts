/**
 * Verifies the R2 fake's etag / conditional-put semantics, which the feature-03
 * distributed-lock tests depend on.
 */
import { makeFakeR2 } from "./r2";

describe("FakeR2 etag semantics", () => {
  it("assigns a fresh etag on every put and exposes it via get/head", async () => {
    const r2 = makeFakeR2();
    const first = await r2.put("k", "v1");
    const afterGet = await r2.get("k");
    expect(first?.etag).toBe(afterGet?.etag);

    const second = await r2.put("k", "v2");
    expect(second?.etag).not.toBe(first?.etag); // new write → new etag
  });

  it("get returns a body exposing text() and json()", async () => {
    const r2 = makeFakeR2();
    await r2.put("k", JSON.stringify({ data: 5 }));
    const body = await r2.get("k");
    expect(await body?.text()).toBe('{"data":5}');
    expect(await body?.json()).toEqual({ data: 5 });
  });

  it("onlyIf.etagMatches writes only when the etag matches, else returns null", async () => {
    const r2 = makeFakeR2();
    const created = await r2.put("k", "v1");
    const etag = created!.etag;

    // Matching etag → write succeeds and returns an object.
    const ok = await r2.put("k", "v2", { onlyIf: { etagMatches: etag } });
    expect(ok).not.toBeNull();
    expect((await r2.get("k"))?.text && (await (await r2.get("k"))!.text())).toBe(
      "v2",
    );

    // Stale etag → precondition fails, returns null, value unchanged.
    const stale = await r2.put("k", "v3", { onlyIf: { etagMatches: etag } });
    expect(stale).toBeNull();
    expect(await (await r2.get("k"))!.text()).toBe("v2");
  });

  it("returns null for a missing key and supports delete", async () => {
    const r2 = makeFakeR2();
    expect(await r2.get("missing")).toBeNull();
    await r2.put("k", "v");
    await r2.delete("k");
    expect(await r2.get("k")).toBeNull();
  });
});
