import { increaseProductsStock } from "@product-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { expireCheckoutSession } from "@stripe-adapter";
import { getProductsFromMetadata } from "../utils/get-products-from-metadata";
import { stockClient } from "@r2-adapter";
import { getCookieHeader } from "@http-utils";

const NO_MAX_AGE = 0;

export const invalidateCheckoutSession: ProtectedModuleFunction = async (
  tokens,
  remember,
  checkoutSessionId: string,
) => {
  const session = await expireCheckoutSession(checkoutSessionId);
  const { products: productsString } = session.metadata || {};
  const products = getProductsFromMetadata(productsString || "");
  const updatedProducts = await increaseProductsStock(products);
  for (const product of updatedProducts) {
    await stockClient.update(product);
  }
  const deletedSessionCookie = getCookieHeader("c_s", "", NO_MAX_AGE);
  return protectedSuccessResponse.OK(
    tokens,
    "checkout session invalidated",
    undefined,
    remember,
    {
      "Set-Cookie": deletedSessionCookie,
    },
  );
};
