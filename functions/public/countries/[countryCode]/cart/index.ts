import { protectedSuccessResponse } from "@response-entity";
import { getCart } from "@cart-module";
import { requestHandler } from "@decorator-utils";

const GET: PagesFunction = async () => {
  const cart = await getCart(true);

  return protectedSuccessResponse.OK("success getting cart", cart);
};

export const onRequest = requestHandler({ GET });
