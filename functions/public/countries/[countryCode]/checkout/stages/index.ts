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
import type { CheckoutStageName } from "@checkout-session-entity";
import { CheckoutStageNameEnum } from "@checkout-session-entity";
import { extendCart } from "@extender-utils";
import { toCartDTO } from "@cart-entity";
import { getUserDetails } from "@user-module";
import { getAddress } from "@address-module";
import { getCheckoutReview } from "@order-module";
import { getShippingMethods } from "@shipping-module";

export const getCheckoutStageData = async (
  stage: CheckoutStageName | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  if (stage === CheckoutStageNameEnum.PERSONAL_DETAILS) {
    return { personalDetails: await getUserDetails() };
  } else if (stage === CheckoutStageNameEnum.ADDRESS) {
    return {
      address: await getAddress(),
    };
  } else if (stage === CheckoutStageNameEnum.SHIPPING) {
    const { shippingMethods, selectedShippingMethod } =
      await getShippingMethods();
    return {
      shippingMethods,
      selectedShippingMethod,
    };
  } else if (stage === CheckoutStageNameEnum.REVIEW) {
    const { shippingMethod, totalPrice, cart, personalDetails, address } =
      await getCheckoutReview();
    return {
      shippingMethod,
      totalPrice,
      cart,
      personalDetails,
      address,
    };
  } else if (stage === undefined) {
    return {};
  } else {
    throw errors.NOT_ALLOWED("Unknown checkout stage");
  }
};

export const onRequestGet = checkoutRequestHandler(async () => {
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
}, null);
