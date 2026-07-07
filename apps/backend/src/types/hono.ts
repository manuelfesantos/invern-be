import type Env from "@env-entity";

/** Hono generics for this Worker: Cloudflare bindings live on `c.env`. */
export type HonoEnv = { Bindings: Env };
