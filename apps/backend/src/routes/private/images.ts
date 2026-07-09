import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { uploadImage } from "@image-module";

const images = new Hono<HonoEnv>();

// Upload a file → R2 → hosted URL. Multipart form-data with a `file` field.
images.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const result = await uploadImage(body.file);
  return successResponse.OK("Image uploaded successfully", result);
});

export default images;
