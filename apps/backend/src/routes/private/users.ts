import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getQueryFromUrl } from "@http-utils";
import { successResponse } from "@response-entity";
import { deleteUser, getAllUsers, getUser } from "@user-module";

const users = new Hono<HonoEnv>();

users.get("/", async (c) => {
  const query = getQueryFromUrl(c.req.url);
  const result = await getAllUsers(query?.get("page"), query?.get("pageSize"));
  return successResponse.OK("Users fetched successfully", result);
});

users.get("/:id", async (c) => {
  const user = await getUser(c.req.param("id"), false);
  return successResponse.OK("User fetched successfully", user);
});

users.delete("/:id", async (c) => {
  await deleteUser(c.req.param("id"));
  return successResponse.OK("User deleted successfully");
});

export default users;
