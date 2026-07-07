import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import {
  addCollection,
  deleteCollection,
  getAllCollections,
  getCollectionDetails,
  updateCollection,
} from "@collection-module";

const collections = new Hono<HonoEnv>();

collections.get("/", async () =>
  successResponse.OK("success getting collections", await getAllCollections()),
);

collections.post("/", async (c) => {
  const collection = await addCollection(await getBodyFromRequest(c.req.raw));
  return successResponse.CREATED("success adding collection", collection);
});

collections.get("/:id", async (c) => {
  const collection = await getCollectionDetails(c.req.param("id"), true);
  return successResponse.OK("success getting collection details", collection);
});

collections.put("/:id", async (c) => {
  const collection = await updateCollection(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("success updating collection", collection);
});

collections.delete("/:id", async (c) => {
  await deleteCollection(c.req.param("id"));
  return successResponse.OK("success deleting collection");
});

export default collections;
