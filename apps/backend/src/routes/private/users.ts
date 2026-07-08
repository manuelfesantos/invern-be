import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getPaginationParams } from "@http-utils";
import { successResponse } from "@response-entity";
import { deleteUser, getAllUsers, getUser } from "@user-module";

const users = new Hono<HonoEnv>();

users.get("/", async (c) =>
  successResponse.OK(
    "Users fetched successfully",
    await getAllUsers(getPaginationParams(c.req.url)),
  ),
);

users.get("/:id", async (c) => {
  const user = await getUser(c.req.param("id"), false);
  return successResponse.OK("User fetched successfully", user);
});

users.delete("/:id", async (c) => {
  await deleteUser(c.req.param("id"));
  return successResponse.OK("User deleted successfully");
});

export default users;
