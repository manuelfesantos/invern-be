import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { imageClient } from "@r2-adapter";
import { errors } from "@error-handling-utils";

/**
 * Serves an uploaded image object from R2 by key. In production images are
 * served directly from the R2 public domain (`IMAGES_HOST`); locally that domain
 * isn't reachable, so this route makes the upload URL resolvable on the worker
 * itself (set `IMAGES_HOST` to `http://localhost:<port>/public/images`).
 */
const images = new Hono<HonoEnv>();

images.get("/:key", async (c) => {
  const object = await imageClient.get(c.req.param("key"));
  if (!object) {
    throw errors.IMAGE_NOT_FOUND();
  }
  const headers = new Headers();
  const contentType = object.httpMetadata?.contentType;
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
});

export default images;
