# Testing

Unit tests run on **Jest + ts-jest** (`jest.config.ts`). tsconfig path aliases
(`@jwt-utils`, `@schema`, …) resolve in tests via `pathsToModuleNameMapper`.

```bash
npm test          # jest --coverage
npm test -- test/smoke   # run a subset
```

## The harness (`test/harness.ts`)

The runtime depends on three process-global stores normally set up by request
middleware. Any code that touches them will throw in a bare test:

- **`ENV`** — a proxy that throws on any unset/unknown key (`@env-utils`).
- **logger** — `logger()` throws with `"logger store is not initialized"` until
  `withLogger` has entered its AsyncLocalStorage.
- **request context** — `contextStore.context` throws until `contextStore.run`
  has entered.

`withTestContext(fn, options?)` initialises all three, then runs `fn`:

```ts
import { withTestContext } from "../harness";

const result = await withTestContext(
  async () => myUseCase(),
  {
    context: { userId: "user-1", cartId: "cart-1" }, // pre-set request context
    env: { LOGGER_LEVEL: "20" },                      // override fake Env keys
  },
);
```

The fake `Env` includes **every** key (the ENV proxy throws otherwise), with KV
namespaces and R2 buckets backed by in-memory fakes. `LOGGER_LEVEL` defaults to
`"100"` so logging is silent in tests; lower it if you want to assert on logs.

`INVERN_DB` is a throwing proxy — accessing D1 in a unit test fails loudly on
purpose. Mock the DB layer instead (below).

## Fakes (`test/fakes/`)

- **`kv.ts`** — `FakeKV`, a Map-backed `KVNamespace` recording `expirationTtl`.
- **`r2.ts`** — `FakeR2`, a Map-backed `R2Bucket` with **faithful etag /
  conditional-put semantics**: every `put` assigns a new etag; `put(…, { onlyIf:
  { etagMatches } })` returns `null` when the etag doesn't match. The R2 lock
  tests (feature 03) depend on this being accurate.
- **`logger.ts`** — `FakeLogger`, capturing `addData`/`log` calls.

Access a fake's state after a run by passing your own bindings:

```ts
import { makeTestBindings } from "../harness";
const bindings = makeTestBindings();
await withTestContext(() => doThing(), { bindings });
expect(bindings.stockKv.store.get("product-1")?.value).toBe("5");
```

## Mocking DB actions

Data access goes through action factories in `libs/db/**/actions/*` (built by
`actionBuilder`), which use-cases import via `@*-db` aliases. Each factory
returns an object with an async `run()`. Mock the module and return that shape:

```ts
import { getAllCollections } from "@collection-module";

jest.mock("@collection-db", () => ({
  getSelectCollectionsAction: () => ({ run: async () => fakeCollections }),
}));

it("returns the mocked rows", async () => {
  expect(await getAllCollections()).toEqual(fakeCollections);
});
```

See `test/smoke/get-all-collections.test.ts` for the worked example.

## Not faked here

We do **not** fake D1/Drizzle at the SQL level — use-case tests mock actions.
If real-SQL coverage is wanted later, options are `better-sqlite3` + drizzle, or
a live local D1 via `wrangler d1 execute --local` for integration tests. That's
a follow-up, not part of this harness.
