# dev-tunnel — expose the dev backoffice behind Google login

Reach your **local** backoffice from your phone (or anywhere), with everything
gated behind Google login for one allow-listed email. Nothing is reachable until
you've authenticated.

```
phone ──► Cloudflare tunnel ──► oauth2-proxy (Google, your email only) ──► Vite :5173 ──► /api ──► wrangler :8790
         (https://dev.invernspirit.com)                                   (host)                (host)
```

The dev servers keep running **on your machine** (hot-reload, local D1/KV/R2
state). Only the auth + tunnel layer runs in Docker.

## One-time setup

### 1. Pick a hostname
A subdomain of your Cloudflare domain, e.g. `dev.invernspirit.com`. Put it in
`.env` as `DEV_HOSTNAME`.

### 2. Google OAuth client
Google Cloud Console → **APIs & Services → Credentials → Create credentials →
OAuth client ID → Web application**:
- **Authorized redirect URI:** `https://dev.invernspirit.com/oauth2/callback`

Copy the **Client ID** and **Client secret** into `.env`.

### 3. Cloudflare Tunnel
Cloudflare **Zero Trust → Networks → Tunnels → Create a tunnel → Cloudflared**:
- Name it (e.g. `invern-dev`), choose **Docker** — copy the **tunnel token** into
  `.env` as `CLOUDFLARE_TUNNEL_TOKEN`.
- Add a **Public hostname**: `dev.invernspirit.com` → Service
  `HTTP` `oauth2-proxy:4180`. (The DNS record is created for you.)

### 4. Cookie secret + env file
```bash
cd dev-tunnel
cp .env.example .env
# generate the cookie secret:
openssl rand -base64 32 | tr -- '+/' '-_'   # paste into OAUTH2_PROXY_COOKIE_SECRET
# then fill in the Google + tunnel values
```

`authenticated-emails.txt` already contains the one allowed address — edit it to
add/remove people.

## Run

Start the dev servers on the host (two terminals, from the repo root):
```bash
npm start                    # backend  (wrangler, :8790)
npm run local -w backoffice  # backoffice (Vite, :5173)
```

Bring up the tunnel + auth layer:
```bash
docker compose -f dev-tunnel/docker-compose.yml up -d
```

Open **https://dev.invernspirit.com** on your phone → Google login (only your
email passes) → the backoffice. Tear down with:
```bash
docker compose -f dev-tunnel/docker-compose.yml down
```

## How the pieces fit
- **oauth2-proxy** is the front door: every request must pass Google auth as an
  allow-listed email; only then does it proxy to the Vite dev server.
- The backoffice is **single-origin** (Vite serves the UI and proxies `/api/*`
  to the backend — see `apps/backoffice/vite.config.ts`), so there's no second
  hostname, no CORS, and the backend is never publicly exposed on its own.
- Two auth layers, by design: Cloudflare/Google gates *access to the environment*;
  the backoffice's own admin login gates *the app* — the same as production.

## Notes & caveats
- **Security:** while the tunnel is up, the environment is on the public internet
  (behind Google). Bring it `down` when you're done. Never commit `.env`.
- **Vite HMR** may not connect over the tunnel (the app still works, just no live
  reload on the remote device).
- **Quick alternative:** if you don't want to manage a Google client, Cloudflare
  Access (Zero Trust) can gate the same tunnel by email at the edge — drop
  oauth2-proxy and add an Access policy on the hostname instead.
- **A second hostname** (e.g. exposing the raw backend for a separate consumer)
  is a small addition: add another `--upstream` / tunnel public-hostname route.
