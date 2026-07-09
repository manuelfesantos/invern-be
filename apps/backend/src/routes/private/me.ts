import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getCredentials } from "@jwt-utils";
import { successResponse } from "@response-entity";
import { getAdminUserDetail } from "@user-module";
import { errors } from "@error-handling-utils";

const me = new Hono<HonoEnv>();

// The current admin's own profile (safe projection incl. role). The backoffice
// calls this right after login to confirm ADMIN and show who's signed in — the
// access token is encrypted and the login DTO omits role, so this is the client's
// only way to learn its identity/role.
me.get("/", async (c) => {
  const { userId } = await getCredentials(c.req.raw.headers);
  if (!userId) {
    throw errors.UNAUTHORIZED();
  }
  return successResponse.OK(
    "Current admin fetched successfully",
    await getAdminUserDetail(userId),
  );
});

export default me;
