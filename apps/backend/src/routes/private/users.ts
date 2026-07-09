import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getListQueryParams } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  adminDeleteUser,
  getAdminUserDetail,
  getAllUsers,
  updateUserAdmin,
} from "@user-module";

const users = new Hono<HonoEnv>();

users.get("/", async (c) =>
  successResponse.OK(
    "Users fetched successfully",
    await getAllUsers(getListQueryParams(c.req.url)),
  ),
);

// Safe admin projection (role included; never the password hash or google id).
users.get("/:id", async (c) => {
  const user = await getAdminUserDetail(c.req.param("id"));
  return successResponse.OK("User fetched successfully", user);
});

// Admin update: role / isValidated / disabled (whitelisted). Role & disable
// changes revoke the target's session; the last admin can't be demoted/disabled.
users.put("/:id", async (c) => {
  const user = await updateUserAdmin(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("User updated successfully", user);
});

// Guarded hard-delete (the last admin can't be deleted).
users.delete("/:id", async (c) => {
  await adminDeleteUser(c.req.param("id"));
  return successResponse.OK("User deleted successfully");
});

export default users;
