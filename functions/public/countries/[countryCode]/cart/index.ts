import { protectedSuccessResponse } from "@response-entity";
import { getCart } from "@cart-module";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async () => {
  const cart = await getCart(true);

  return protectedSuccessResponse.OK("success getting cart", cart);
});
