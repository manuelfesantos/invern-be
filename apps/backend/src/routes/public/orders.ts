import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { authContext } from "../../middleware/auth-context";
import { successResponse, protectedSuccessResponse } from "@response-entity";
import { getOrder, getUserOrders } from "@order-module";
import { contextStore } from "@context-utils";
import { errors } from "@error-handling-utils";
import { setCustomerEmailCookieInResponse } from "@http-utils";
import { encrypt } from "@crypto-utils";

const orders = new Hono<HonoEnv>();

orders.use("*", authContext);

orders.get("/", async () => {
  const { userId } = contextStore.context;
  if (!userId) {
    throw errors.UNAUTHORIZED();
  }
  const userOrders = await getUserOrders(userId);
  return protectedSuccessResponse.OK("Successfully got user orders", {
    orders: userOrders,
  });
});

orders.get("/:id", async (c) => {
  const email = c.req.header("x-user-email");
  const order = await getOrder(c.req.param("id"), true, email ?? undefined);
  const response = successResponse.OK("Successfully got order", { order });
  if (email) {
    setCustomerEmailCookieInResponse(response, await encrypt(email));
  }
  return response;
});

export default orders;
