# Deployment

Two environments, **separate Cloudflare resources each**, driven by branches:

| Branch    | Env          | Backend worker              | Backoffice worker              |
| --------- | ------------ | --------------------------- | ------------------------------ |
| `preview` | `preview`    | `invern-backend-preview`    | `invern-backoffice-preview`    |
| `main`    | `production` | `invern-backend-production` | `invern-backoffice-production` |

Merging to `preview` (from a feature branch) or to `main` (only from `preview`)
auto-runs the deploy workflows. The backend workflow **applies that env's remote
D1 migrations, then deploys**; the backoffice workflow **builds with the env's
`VITE_API_BASE_URL`, then deploys**. Both target the env via `wrangler --env`.

## CI/CD (already scaffolded)

- `.github/actions/setup-node` · `.github/actions/deploy-cloudflare` — shared composites.
- `.github/workflows/deploy-backend.yml` — type-check → migrate (`--env`) → deploy (`--env`).
- `.github/workflows/deploy-backoffice.yml` — build (env `VITE_API_BASE_URL`) → deploy (`--env`).
- `quality-gate.yml` + `validate-pr-to-{preview,main}.yml` — lint/test on PRs; PRs into `main` must come from `preview`.

You can also deploy manually: `npm run deploy:preview -w backend`, `-w backoffice`, etc.

## One-time provisioning (do this per environment)

### 1. Create the resources (or reuse existing) and record their IDs

Per env you need: **1 D1 DB**, **3 KV namespaces** (auth, validation, stock),
**2 R2 buckets** (images, stock).

```bash
cd apps/backend
wrangler d1 create invern-db-preview            # -> database_id
wrangler kv namespace create AUTH_KV --env preview
wrangler kv namespace create VALIDATION_KV --env preview
wrangler kv namespace create STOCK_KV --env preview
wrangler r2 bucket create invern-images-preview
wrangler r2 bucket create invern-stock-preview
# ...repeat with -production names for the production env.
```

### 2. Fill the placeholders in `apps/backend/wrangler.jsonc`

Replace every `REPLACE_WITH_*` (D1 `database_id`s, KV `id`s) and confirm the
bucket names + `routes` hostnames match what you created. Do the same for the
`routes` in `apps/backoffice/wrangler.jsonc`. Adjust the `vars` hostnames
(`DOMAIN`, `FRONTEND_HOST`, `IMAGES_HOST`, `STOCK_HOST`, `GOOGLE_REDIRECT_URI`)
to your real domains.

### 3. Set the Worker runtime secrets (never in CI)

Per env, for the backend:

```bash
cd apps/backend
for S in TOKEN_SECRET REFRESH_TOKEN_SECRET ENCRYPTION_KEY SALT SETUP_STOCK_SECRET \
         STRIPE_API_KEY STRIPE_CHECKOUT_SECRET STRIPE_PAYMENT_SECRET \
         GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET BREVO_API_KEY; do
  wrangler secret put "$S" --env preview      # then again --env production
done
```

(`STRIPE_CHECKOUT_SECRET` / `STRIPE_PAYMENT_SECRET` are the Stripe **webhook
signing secrets**. Non-secret vars like `DOMAIN`/`ENV`/`STRIPE_ENV` live in
`wrangler.jsonc` `vars`, not here.)

### 4. Set the GitHub repo secrets (for the pipeline)

- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_BASE_URL_PREVIEW` (e.g. `https://api-preview.invernspirit.com`)
- `VITE_API_BASE_URL_PRODUCTION` (e.g. `https://api.invernspirit.com`)

### 5. Domains, Stripe, OAuth, email

- **Custom domains + DNS**: the `routes` in the wrangler configs (`custom_domain: true`)
  attach the hostnames; make sure the zone/DNS exists in the Cloudflare account.
- **Stripe**: create a webhook endpoint per env pointing at the backend's Stripe
  route; put its signing secret(s) in the secrets above. Keep `STRIPE_ENV=test`
  until you're ready to switch production to `live` (and swap in live keys).
- **Google OAuth**: add each env's `GOOGLE_REDIRECT_URI` to the OAuth client's
  authorized redirect URIs.
- **Brevo**: verify the sender domain; set `BREVO_API_KEY`.

## First deploy (order matters)

1. Provision resources, fill placeholders, set secrets + GitHub secrets (above).
2. Merge to **`preview`** → backend migrates + deploys, backoffice deploys to staging.
3. Smoke-test on the preview hostnames: log in, create the first admin
   (`npm run create-admin` against the preview DB), seed commerce config
   (countries/currencies/taxes/shipping) from the admin UI, place a test order.
4. Open a PR **`preview` → `main`**; on merge, the same runs against production.

## Notes

- Named wrangler envs do **not** inherit bindings/vars/routes/triggers/ratelimits —
  each env in `wrangler.jsonc` repeats them with its own values (by design).
- The **top level** of each `wrangler.jsonc` is **local dev only** (`wrangler dev`
  uses it with `.dev.vars`); it is never deployed.
- Seed product images point at the prod CDN (see `scripts/seed.mjs`) — set each
  env's `IMAGES_HOST` to that env's R2 public domain for uploaded images.
