import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getListQueryParams } from "@http-utils";
import { successResponse } from "@response-entity";
import { addCollection, getCollectionsPage } from "@collection-module";

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

export default collections;
