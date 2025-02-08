import { protectedSuccessResponse } from "@response-entity";
import { getCart } from "@cart-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = async () => {
  const cart = await getCart();

  return protectedSuccessResponse.OK("success getting cart", cart);
};

export const onRequest = requestHandler({ GET });
