# Invern Spirit — project rules

Project-specific rules live in `.claude/rules/` and are part of the standard here.

**API contract sync (summary):** any change that affects the HTTP API contract —
adding/removing/renaming an endpoint, or changing a request (body, query/path
params, auth) or response (shape, envelope, status codes) — MUST update
`swagger.yaml` **and** the `bruno/` collection in the same change. See the full
rule below.

@.claude/rules/api-contract-sync.md
