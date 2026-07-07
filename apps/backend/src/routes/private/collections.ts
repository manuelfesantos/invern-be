import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest } from "@http-utils";
import { successResponse } from "@response-entity";
import { addCollection, getAllCollections } from "@collection-module";

const collections = new Hono<HonoEnv>();

collections.get("/", async () =>
  successResponse.OK(
    "Collections fetched successfully",
    await getAllCollections(),
  ),
);

collections.post("/", async (c) => {
  const collection = await addCollection(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Collection created successfully", collection);
});

export default collections;
