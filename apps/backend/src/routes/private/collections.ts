import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getListQueryParams } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  addCollection,
  deleteCollection,
  getCollectionDetails,
  getCollectionsPage,
  updateCollection,
} from "@collection-module";

const collections = new Hono<HonoEnv>();

collections.get("/", async (c) =>
  successResponse.OK(
    "Collections fetched successfully",
    await getCollectionsPage(getListQueryParams(c.req.url)),
  ),
);

collections.post("/", async (c) => {
  const collection = await addCollection(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Collection created successfully", collection);
});

collections.get("/:id", async (c) => {
  const collection = await getCollectionDetails(c.req.param("id"), true);
  return successResponse.OK("Collection details fetched successfully", collection);
});

collections.put("/:id", async (c) => {
  const collection = await updateCollection(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Collection updated successfully", collection);
});

collections.delete("/:id", async (c) => {
  await deleteCollection(c.req.param("id"));
  return successResponse.OK("Collection deleted successfully");
});

export default collections;
