import type { MiddlewareHandler } from "hono";
import { setupCheckoutStages } from "@context-utils";
import type { HonoEnv } from "../types/hono";

/**
 * Prepares the checkout stage machine for `/checkout/*` routes (runs after
 * `authContext`, which the checkout endpoints also require).
 */
export const checkoutContext: MiddlewareHandler<HonoEnv> = async (c, next) => {
  await setupCheckoutStages();
  return next();
};
