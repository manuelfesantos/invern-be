---
status: Not Started
priority: P0
feature: 14-api-contract-typed-client
track: backend-api-completion
blocks: ["15-backoffice-scaffolding/step-04"]
depends_on: ["14-api-contract-typed-client/step-02"]
---
# Step 03: In-repo typed client package for the backoffice

**Status:** Not Started · **Priority:** P0 · **Feature:** [API Contract & Typed Client](./README.md)

## Technical goal
Produce a typed API client generated from the (now accurate, freshness-checked) `swagger.yaml` as an **in-repo workspace package** (`packages/api-client`) that any app in the monorepo can depend on, and define how it is regenerated — so the backoffice's request/response types are honest against the real contract, enforced at compile time.

## User impact
None directly; gives the backoffice accurate types, turning contract changes into compile-time errors instead of runtime failures.

## Current state
- No generated client exists. The backoffice is a new app in this same monorepo ([15](../15-backoffice-scaffolding/README.md)), so the client can be a shared workspace package rather than anything published.
- The spec becomes trustworthy after [step-02](./step-02-openapi-generation-and-ci-check.md).
- `openapi-typescript` (types) and/or a fuller client generator (e.g. `openapi-fetch`, `orval`) are the standard options; none installed yet.

## Technical steps
1. Choose the generator (document): **`openapi-typescript` + `openapi-fetch`** — a lightweight typed fetch layer that pairs cleanly with TanStack Query and lets the backoffice keep TanStack Query as the data layer ([15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md)). (`orval`'s generated hooks are the alternative if we later want them.)
2. Delivery mechanism (**decided by the monorepo move**): create `packages/api-client` as a workspace package that exports the generated types + a client factory + the auth-injection hook. Apps depend on it via the workspace (`"@invern/api-client": "*"`); **no publish/registry step**. The old "generate a copy into each app" option is dropped — one shared package, single source of types.
3. Spec source for generation: read the backend spec directly from its sibling path in the repo (`apps/backend/swagger.yaml`, or wherever it settles) — no URL fetching or version pinning needed, since generator and spec live in the same tree and move together.
4. Regeneration workflow: a `generate:api` script in the package (runnable via `turbo run generate:api --filter=@invern/api-client`) reads the sibling spec and writes the client. A CI freshness check fails if the committed client is stale relative to the current spec — pairs with [step-02](./step-02-openapi-generation-and-ci-check.md)'s "spec matches the code" check to close the loop end to end within one PR.
5. Provide a minimal usage example (a typed call to one `/private/*` endpoint with the auth hook) that [15](../15-backoffice-scaffolding/README.md) builds the data layer on.

## Dependencies
**Depends on:** [step-02](./step-02-openapi-generation-and-ci-check.md) (accurate, checked spec).
**Blocks:** [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md) (the backoffice adds this package as a workspace dep and wires it into TanStack Query).

## Implementation notes
- **One package, many potential consumers.** Because it's in-repo, the same `packages/api-client` can be consumed by the backoffice today and by any future app (or even backend tests) without publishing. That's the main win over the old separate-repo model, where the client had to be generated-into or published.
- Keep the generated client a build artifact, not hand-edited — edits belong in the spec.
- Version skew mostly disappears in the monorepo: generator and spec are in the same commit, so a spec change and its client regen land together, gated by the freshness check.
- Auth: the client factory needs a place to inject the JWT (Authorization header / credentials for the cookie). Define that hook here so [16](../16-backoffice-auth-shell/README.md) can plug the token in.

## Acceptance criteria
- [ ] `packages/api-client` exists as a workspace package exporting typed operations + a client factory + auth hook (generator + config decided and documented).
- [ ] A reproducible `generate:api` script reads the sibling `swagger.yaml` and (re)builds the client.
- [ ] A CI freshness check fails when the committed client is stale vs the current spec.
- [ ] A minimal typed-call example (with the auth hook) is provided for [15](../15-backoffice-scaffolding/README.md) to build on.

## References
- `swagger.yaml` — the generation source (sibling path in the monorepo).
- [step-02](./step-02-openapi-generation-and-ci-check.md) — spec freshness (upstream guarantee).
- [15 step-04](../15-backoffice-scaffolding/step-04-api-client-integration.md), [16](../16-backoffice-auth-shell/README.md) — the consumers of this package + auth hook.
- The `7-30` monorepo `packages/*` (e.g. `types`) — reference for a shared in-repo package.
