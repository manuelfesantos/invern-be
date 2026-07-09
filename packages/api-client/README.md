# @invern/api-client

Typed API client for the Invern Spirit backend, **generated from `swagger.yaml`**.
Every request/response is checked at compile time against the OpenAPI contract —
a spec change that breaks a call surfaces as a type error, not a runtime bug.

In-repo workspace package: apps depend on it via `"@invern/api-client": "*"`; it
is never published. It is consumed by the backoffice (Feature 15) and wired into
TanStack Query (Feature 15 step 04).

## Usage

```ts
import { createApiClient } from "@invern/api-client";

// Auth token comes from wherever the app keeps it (Feature 16 auth store).
const api = createApiClient({
  baseUrl: "http://localhost:8790",
  getToken: () => authStore.accessToken, // called per-request
});

// Typed call — path, params, body, and response are all checked against swagger.yaml.
const { data, error } = await api.PUT("/private/orders/{id}/fulfillment", {
  params: { path: { id: orderId } },
  body: { status: "shipped", trackingUrl: "https://tracker/123" },
});

if (error) {
  // `error` is the typed error envelope
} else {
  // `data` is the typed success response
}
```

`getToken` sets `Authorization: Bearer <token>`; the `s_r` refresh cookie is sent
automatically (`credentials: "include"`). Public routes work with no token.

## Regeneration

The generated client (`src/schema.d.ts`) is a **build artifact — never hand-edit
it**. Edits belong in `swagger.yaml`, then:

```bash
npm run generate:api -w @invern/api-client   # swagger.yaml → src/schema.d.ts
```

CI runs `check:api`, which fails if the committed client is stale relative to the
spec — so a spec change and its regenerated client must land in the same PR. This
pairs with the repo's `openapi:check` (which fails if `swagger.yaml` drifts from
the real routes), closing the loop: **routes → spec → client**.
