import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { getAllCollections, getCollectionDetails } from "@collection-module";

// Read-only: the storefront needs collection list + details for SSG. All
// collection mutations live under `/private/collections` (admin-gated).
const collections = new Hono<HonoEnv>();

collections.get("/", async () =>
  successResponse.OK("success getting collections", await getAllCollections()),
);

collections.get("/:id", async (c) => {
  const collection = await getCollectionDetails(c.req.param("id"), true);
  return successResponse.OK("success getting collection details", collection);
});

export default collections;
