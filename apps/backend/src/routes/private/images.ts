import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getQueryFromUrl } from "@http-utils";
import { successResponse } from "@response-entity";
import { urlFromKey } from "@r2-adapter";
import {
  createImage,
  deleteImage,
  getImagesForProduct,
  updateImage,
  uploadImage,
} from "@image-module";

const images = new Hono<HonoEnv>();

// Upload a file → R2 → hosted URL. Multipart form-data with a `file` field.
images.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const result = await uploadImage(body.file);
  return successResponse.OK("Image uploaded successfully", result);
});

// List a product's images (?productId=...).
images.get("/", async (c) => {
  const productId = getQueryFromUrl(c.req.url)?.get("productId") ?? "";
  return successResponse.OK(
    "Images fetched successfully",
    await getImagesForProduct(productId),
  );
});

// Create an image record for an uploaded URL + associate it.
images.post("/", async (c) => {
  const image = await createImage(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Image created successfully", image);
});

// Update an image (identified by `url` in the body).
images.put("/", async (c) => {
  const image = await updateImage(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Image updated successfully", image);
});

// Delete an image record and its underlying R2 object (identified by its R2 key).
images.delete("/:key", async (c) => {
  await deleteImage(urlFromKey(c.req.param("key")));
  return successResponse.OK("Image deleted successfully");
});

export default images;
