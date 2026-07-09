/**
 * @invern/api-client factory + auth middleware — runtime behavior. A stub fetch
 * captures the outgoing Request so we can assert the client injects the JWT
 * bearer per-request, omits it when signed out, sets credentials for the s_r
 * cookie, and joins the base URL — the parts the generated types can't prove.
 */
import { createApiClient } from "../../packages/api-client/src/index";

/** A fetch stub that records each Request and replies 200 with a JSON body. */
function recordingFetch() {
  const calls: Request[] = [];
  const fetch = (request: Request): Promise<Response> => {
    calls.push(request);
    return Promise.resolve(
      new Response(JSON.stringify({ message: "ok", data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  };
  return { calls, fetch };
}

describe("createApiClient auth middleware", () => {
  it("injects Authorization: Bearer when a token is present", async () => {
    const { calls, fetch } = recordingFetch();
    const api = createApiClient({
      baseUrl: "http://api.test",
      getToken: () => "tok-123",
      fetch,
    });

    const { response } = await api.GET("/public/countries");

    expect(response.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0].headers.get("Authorization")).toBe("Bearer tok-123");
    expect(calls[0].url).toBe("http://api.test/public/countries");
    expect(calls[0].credentials).toBe("include"); // sends the s_r cookie
  });

  it("omits Authorization when the token getter returns null (signed out)", async () => {
    const { calls, fetch } = recordingFetch();
    const api = createApiClient({
      baseUrl: "http://api.test",
      getToken: () => null,
      fetch,
    });

    await api.GET("/public/countries");

    expect(calls[0].headers.get("Authorization")).toBeNull();
  });

  it("works with no token getter at all (public-only client)", async () => {
    const { calls, fetch } = recordingFetch();
    const api = createApiClient({ baseUrl: "http://api.test", fetch });

    const { response } = await api.GET("/public/countries");

    expect(response.status).toBe(200);
    expect(calls[0].headers.get("Authorization")).toBeNull();
  });

  it("reads the token per-request, so a refreshed token is used on the next call", async () => {
    const { calls, fetch } = recordingFetch();
    let token = "first";
    const api = createApiClient({
      baseUrl: "http://api.test",
      getToken: () => token,
      fetch,
    });

    await api.GET("/public/countries");
    token = "second";
    await api.GET("/public/countries");

    expect(calls[0].headers.get("Authorization")).toBe("Bearer first");
    expect(calls[1].headers.get("Authorization")).toBe("Bearer second");
  });
});
