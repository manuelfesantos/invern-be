import { requestHandler } from "@decorator-utils";
import { getAvailableCheckoutStages } from "@order-module";
import { protectedSuccessResponse } from "@response-entity";

const GET: PagesFunction = async () => {
  const availableCheckoutStages = await getAvailableCheckoutStages();
  return protectedSuccessResponse.OK(
    "Checkout stages",
    availableCheckoutStages,
  );
};

export const onRequest = requestHandler({ GET });
