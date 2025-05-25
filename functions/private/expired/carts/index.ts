import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";
import { deleteExpiredCarts } from "@cart-module";

const DELETE: PagesFunction = async () => {
  const responseMessage = await deleteExpiredCarts();
  return successResponse.OK(responseMessage);
};

export const onRequest = requestHandler({ DELETE });
