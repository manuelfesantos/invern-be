---
status: Done
priority: P0
feature: 15-backoffice-scaffolding
track: backoffice-app
depends_on: ["15-backoffice-scaffolding/step-01", "14-api-contract-typed-client/step-03"]
blocks: ["16-backoffice-auth-shell/step-01", "17-backoffice-design-system/step-02"]
---
# Step 04: Typed API client (workspace dep) + TanStack Query data layer

**Status:** Done · **Priority:** P0 · **Feature:** [Backoffice Scaffolding, Tooling & Cloudflare Target](./README.md)

## Technical goal
Wire the in-repo typed client package ([14 step-03](../14-api-contract-typed-client/step-03-typed-client-package.md), `packages/api-client`) into the backoffice as a **workspace dependency**, with a TanStack Query provider, a configured fetch layer (base URL from env, auth-header injection hook, standard error handling) — so every screen fetches data the same typed way. Generation lives in the shared package (feature 14); this step only consumes it.

## User impact
None directly; establishes the single data-fetching pattern all screens use.

## Current state
- Greenfield; no data layer.
- The typed client is an **in-repo workspace package** `packages/api-client` defined in [14 step-03](../14-api-contract-typed-client/step-03-typed-client-package.md) (recommended `openapi-typescript` + `openapi-fetch`, generated from the backend `swagger.yaml`), exposing the client factory + an auth-injection hook point. Because it lives in the same monorepo, the backoffice imports it directly — no publish/registry step, and it always tracks the current spec.
- The API base URL is env-driven from [step-03](./step-03-cloudflare-target-and-config.md).

## Technical steps
1. Add `packages/api-client` as a workspace dependency of `apps/backoffice` (`"@invern/api-client": "*"` / the workspace name). Regeneration is owned by that package (feature 14), not by a per-app script; the backoffice just imports the typed client + operations from it.
2. Configure the fetch layer (`openapi-fetch` client): base URL from `import.meta.env.VITE_API_BASE_URL`; an auth middleware that injects the JWT (Authorization header) and/or sends credentials for the refresh cookie — the exact mechanism aligns with feature [16](../16-backoffice-auth-shell/README.md) and the backend's token handling (`getCredentials` reads tokens from headers; the refresh token is an httpOnly cookie). Decide header-vs-cookie for the access token and document it.
3. Set up TanStack Query: a `QueryClientProvider` at the app root, sensible defaults (retry/staleTime), and a convention for query keys (per entity + params) so caching/invalidation is consistent across screens.
4. Establish the standard data-fetching wrappers: typed `useQuery`/`useMutation` helpers or per-entity hooks that call the generated client, centralizing error handling (map API error envelope → UI error state) and the pagination envelope ([07](../07-pagination-filtering-envelope/README.md)) → table props ([17 step-02](../17-backoffice-design-system/step-02-data-table-component.md)).
5. Global error handling: a query error boundary / toast on unexpected failures, and a 401 handler that triggers token refresh or redirect-to-login (coordinates with [16 step-02](../16-backoffice-auth-shell/step-02-protected-routing-and-refresh.md)).
6. Prove it end-to-end with a throwaway call to a public endpoint (e.g. `GET /public/countries`) rendered in the placeholder, confirming types + fetch + query cache work. Replace with real screens later.

## Dependencies
**Depends on:** [step-01](./step-01-repo-vite-react-ts-tailwind.md), [14 step-03](../14-api-contract-typed-client/step-03-typed-client-package.md).
**Blocks:** [16 step-01](../16-backoffice-auth-shell/step-01-login-flow.md) (auth uses this client), [17 step-02](../17-backoffice-design-system/step-02-data-table-component.md) (table binds to query results).

## Implementation notes
- **The auth-injection hook is the seam with feature 16.** Define it here (a place to read the current token and attach it) even though the login logic lands in [16](../16-backoffice-auth-shell/README.md); that keeps the data layer auth-agnostic.
- Access-token-in-header vs cookie: the backend's `getCredentials` reads tokens from headers (`getTokensFromHeaders`) and also manages a refresh cookie. Decide the backoffice's approach (likely: access token in memory + Authorization header; refresh via the httpOnly cookie with `credentials: 'include'`), document it, and align CORS (`Access-Control-Allow-Credentials`) accordingly ([01 step-03](../01-admin-auth-rbac-cors/step-03-cors-policy-two-origins.md)).
- Standardize on the pagination envelope from [07](../07-pagination-filtering-envelope/README.md) so the table hook is generic across entities.
- Keep the generated client an artifact of the `packages/api-client` package; never hand-edit it, and never re-generate a second copy inside the app.

## Acceptance criteria
- [ ] `apps/backoffice` depends on the `packages/api-client` workspace package and imports the typed client from it (no in-app generation).
- [ ] A configured fetch layer sends requests to the env-driven base URL with an auth-injection hook.
- [ ] TanStack Query is provided app-wide with query-key and error-handling conventions.
- [ ] A standard pattern maps the API pagination envelope + error envelope to UI state.
- [ ] A real typed call renders in the placeholder, proving the stack works end-to-end.

## References
- [14 step-03](../14-api-contract-typed-client/step-03-typed-client-package.md) — the client generator + auth hook.
- [step-03](./step-03-cloudflare-target-and-config.md) — env-driven base URL.
- [07](../07-pagination-filtering-envelope/README.md) — pagination envelope shape.
- [16](../16-backoffice-auth-shell/README.md) — auth that plugs into the injection hook + 401 handling.
- `invern-be` `libs/utils/jwt/credentials/get-credentials.ts` — how the backend reads tokens (header/cookie).
