import {
  checkoutMiddlewareRequestHandler,
  setupCheckoutStages,
} from "@context-utils";

export const onRequest = checkoutMiddlewareRequestHandler(async ({ next }) => {
  await setupCheckoutStages();
  return next();
});
