import { protectedSuccessResponse } from "@response-entity";
// eslint-disable-next-line import/no-restricted-paths
import { validateCartId } from "@cart-db";
import {
  checkoutRequestHandler,
  contextStore,
  getClientCheckoutStages,
} from "@context-utils";
import { errors } from "@error-handling-utils";

const GET: PagesFunction = async () => {
  try {
    const cart = await validateCartId(contextStore.context.cartId);
    if (!cart.products?.length) {
      throw errors.CART_IS_EMPTY();
    }
    return protectedSuccessResponse.OK("Checkout stages", {
      availableCheckoutStages: getClientCheckoutStages(),
    });
  } catch (error) {
    return protectedSuccessResponse.OK("Checkout stages", {
      isCheckoutPossible: false,
    });
  }
};

export const onRequest = checkoutRequestHandler({ GET }, null);
