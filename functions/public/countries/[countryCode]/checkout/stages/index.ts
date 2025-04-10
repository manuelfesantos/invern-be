import { protectedSuccessResponse } from "@response-entity";
// eslint-disable-next-line import/no-restricted-paths
import { validateCartId } from "@cart-db";
import {
  checkoutRequestHandler,
  contextStore,
  getClientCheckoutStages,
  getRemoveCookieNamesFromInvalidCheckoutStage,
} from "@context-utils";
import { errors } from "@error-handling-utils";
import { deleteCookieFromResponse } from "@http-utils";
import { CheckoutStageName } from "@checkout-session-entity";
import { extendCart } from "@extender-utils";
import { toCartDTO } from "@cart-entity";

const GET: PagesFunction = async () => {
  try {
    const cart = await validateCartId(contextStore.context.cartId);

    if (!cart.products?.length) {
      throw errors.CART_IS_EMPTY();
    }

    const extendedCart = extendCart(toCartDTO(cart));
    if (extendedCart.issues && extendedCart.issues.length) {
      throw errors.CART_HAS_ISSUES(extendedCart.issues);
    }

    const clientCheckoutStages = getClientCheckoutStages();
    const lastEnabledCheckoutStage = clientCheckoutStages.findLast(
      (stage) => stage.isEnabled,
    );

    const response = protectedSuccessResponse.OK("Checkout stages", {
      availableCheckoutStages: clientCheckoutStages,
    });

    if (lastEnabledCheckoutStage) {
      getRemoveCookieNamesFromInvalidCheckoutStage(
        lastEnabledCheckoutStage.name as CheckoutStageName,
      ).forEach((cookie) => {
        deleteCookieFromResponse(response, cookie);
      });
    }
    return response;
  } catch {
    return protectedSuccessResponse.OK("Checkout stages", {
      isCheckoutPossible: false,
    });
  }
};

export const onRequest = checkoutRequestHandler({ GET }, null);
