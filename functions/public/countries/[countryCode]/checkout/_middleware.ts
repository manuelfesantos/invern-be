import { middlewareRequestHandler } from "@decorator-utils";
import { setupCheckoutStages } from "@context-utils";

export const onRequest = middlewareRequestHandler(async ({ next }) => {
  await setupCheckoutStages();
  return next();
});
