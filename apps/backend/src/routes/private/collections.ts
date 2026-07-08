import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest } from "@http-utils";
import { successResponse } from "@response-entity";
import { addCollection, getCollectionsPage } from "@collection-module";
import { paginationParams } from "../../http/query";

const collections = new Hono<HonoEnv>();

collections.get("/", async (c) =>
  successResponse.OK(
    "Collections fetched successfully",
    await getCollectionsPage(paginationParams(c)),
  ),
);

collections.post("/", async (c) => {
  const collection = await addCollection(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Collection created successfully", collection);
});

export default collections;
