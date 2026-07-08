import { Hono } from "hono";
import type { Context } from "hono";
import type { HonoEnv } from "../../types/hono";
import { authContext } from "../../middleware/auth-context";
import { checkoutContext } from "../../middleware/checkout-context";
import { protectedSuccessResponse } from "@response-entity";
import { validateCartId } from "@cart-db";
import {
  checkoutErrorHandler,
  contextStore,
  enableNextCheckoutStage,
  getClientCheckoutStages,
  getRemoveCookieNamesFromInvalidCheckoutStage,
  initializeCheckoutStage,
  isCheckoutStageEnabled,
} from "@context-utils";
import { errors } from "@error-handling-utils";
import {
  deleteCookieFromResponse,
  getBodyFromRequest,
  getCookieHeader,
  setCookieInResponse,
} from "@http-utils";
import type { CheckoutStageName } from "@checkout-session-entity";
import { CheckoutStageNameEnum } from "@checkout-session-entity";
import { CookieNameEnum } from "@http-entity";
import { extendCart } from "@extender-utils";
import { toCartDTO } from "@cart-entity";
import { encrypt } from "@crypto-utils";
import { SESSION_EXPIRY } from "@timer-utils";
import { getUserDetails, handleDetailsPost } from "@user-module";
import { getAddress, handleAddressPost } from "@address-module";
import { getCheckoutReview, getCheckoutSession } from "@order-module";
import { getShippingMethods, handleShippingMethodPost } from "@shipping-module";

type CheckoutHandler = (c: Context<HonoEnv>) => Response | Promise<Response>;

/**
 * Native Hono equivalent of the Pages `checkoutRequestHandler`: marks the
 * active stage, then catches any thrown error and renders it through the shared
 * `checkoutErrorHandler` so checkout always responds gracefully. Catching here —
 * inside the handler — keeps the error away from Hono's `app.onError`.
 */
const checkoutRoute =
  (
    stage: CheckoutStageName | null,
    handler: CheckoutHandler,
  ): CheckoutHandler =>
  async (c) => {
    initializeCheckoutStage(stage);
    try {
      return await handler(c);
    } catch (error) {
      return checkoutErrorHandler(error);
    }
  };

/** Hydrates the data payload for a given checkout stage. */
const getCheckoutStageData = async (
  stage: CheckoutStageName | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  if (stage === CheckoutStageNameEnum.PERSONAL_DETAILS) {
    return { personalDetails: await getUserDetails() };
  } else if (stage === CheckoutStageNameEnum.ADDRESS) {
    return { address: await getAddress() };
  } else if (stage === CheckoutStageNameEnum.SHIPPING) {
    const { shippingMethods, selectedShippingMethod } =
      await getShippingMethods();
    return { shippingMethods, selectedShippingMethod };
  } else if (stage === CheckoutStageNameEnum.REVIEW) {
    const { shippingMethod, totalPrice, cart, personalDetails, address } =
      await getCheckoutReview();
    return { shippingMethod, totalPrice, cart, personalDetails, address };
  } else if (stage === undefined) {
    return {};
  } else {
    throw errors.NOT_ALLOWED("Unknown checkout stage");
  }
};

const getStages: CheckoutHandler = async () => {
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
      ).forEach((cookie) => deleteCookieFromResponse(response, cookie));
    }
    return response;
  } catch {
    return protectedSuccessResponse.OK("Checkout stages", {
      isCheckoutPossible: false,
    });
  }
};

const getPersonalDetails: CheckoutHandler = async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.PERSONAL_DETAILS)) {
    throw errors.NOT_ALLOWED("Personal details checkout stage is not enabled");
  }
  const userDetails = await getUserDetails();
  return protectedSuccessResponse.OK("Successfully retrieved user details", {
    ...(userDetails && { personalDetails: userDetails }),
    availableCheckoutStages: getClientCheckoutStages(),
  });
};

const postPersonalDetails: CheckoutHandler = async (c) => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.PERSONAL_DETAILS)) {
    throw errors.NOT_ALLOWED("Personal details checkout stage is not enabled");
  }
  const body = await getBodyFromRequest(c.req.raw);
  const { userDetails, encryptedUserDetails } = await handleDetailsPost(body);
  enableNextCheckoutStage(CheckoutStageNameEnum.PERSONAL_DETAILS);
  const response = protectedSuccessResponse.OK(
    "Successfully created user details",
    {
      ...(await getCheckoutStageData(CheckoutStageNameEnum.ADDRESS)),
      personalDetails: userDetails,
      availableCheckoutStages: getClientCheckoutStages(),
    },
  );
  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.USER_DETAILS, encryptedUserDetails),
  );
  return response;
};

const getAddressStage: CheckoutHandler = async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.ADDRESS)) {
    throw errors.NOT_ALLOWED("Address checkout stage is not enabled");
  }
  const address = await getAddress();
  return protectedSuccessResponse.OK("Successfully got address", {
    ...(address && { address }),
    availableCheckoutStages: getClientCheckoutStages(),
  });
};

const postAddressStage: CheckoutHandler = async (c) => {
  const body = await getBodyFromRequest(c.req.raw);
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.ADDRESS)) {
    throw errors.NOT_ALLOWED("Address checkout stage is not enabled");
  }
  const { address, encryptedAddress } = await handleAddressPost(body);
  enableNextCheckoutStage(CheckoutStageNameEnum.ADDRESS);
  contextStore.context.address = encryptedAddress;
  const response = protectedSuccessResponse.OK("Successfully created address", {
    ...(await getCheckoutStageData(CheckoutStageNameEnum.SHIPPING)),
    address,
    availableCheckoutStages: getClientCheckoutStages(),
  });
  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.ADDRESS, encryptedAddress),
  );
  return response;
};

const getShipping: CheckoutHandler = async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.SHIPPING)) {
    throw errors.NOT_ALLOWED("Shipping checkout stage is not enabled");
  }
  const { shippingMethods, selectedShippingMethod } =
    await getShippingMethods();
  return protectedSuccessResponse.OK("Shipping methods", {
    shippingMethods,
    selectedShippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });
};

const postShipping: CheckoutHandler = async (c) => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.SHIPPING)) {
    throw errors.NOT_ALLOWED("Shipping checkout stage is not enabled");
  }
  const body = await getBodyFromRequest(c.req.raw);
  const { encryptedShippingMethodId, shippingMethod } =
    await handleShippingMethodPost(body);
  enableNextCheckoutStage(CheckoutStageNameEnum.SHIPPING);
  contextStore.context.shippingMethodId = encryptedShippingMethodId;
  const response = protectedSuccessResponse.OK("Shipping method selected", {
    review: await getCheckoutStageData(CheckoutStageNameEnum.REVIEW),
    shippingMethod,
    availableCheckoutStages: getClientCheckoutStages(),
  });
  setCookieInResponse(
    response,
    getCookieHeader(CookieNameEnum.SHIPPING_METHOD, encryptedShippingMethodId),
  );
  return response;
};

const getReview: CheckoutHandler = async () => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.REVIEW)) {
    throw errors.NOT_ALLOWED("Review checkout stage is not enabled");
  }
  const { shippingMethod, totalPrice, cart, personalDetails, address } =
    await getCheckoutReview();
  return protectedSuccessResponse.OK("Checkout review", {
    shippingMethod,
    totalPrice,
    cart,
    personalDetails,
    address,
  });
};

const getPayment: CheckoutHandler = async (c) => {
  if (!isCheckoutStageEnabled(CheckoutStageNameEnum.REVIEW)) {
    throw errors.NOT_ALLOWED("Payment checkout stage is not enabled");
  }
  const origin = c.req.header("origin") || undefined;
  const { url, checkoutSessionId } = await getCheckoutSession(origin);
  const checkoutSessionToken = await encrypt(checkoutSessionId);
  const response = protectedSuccessResponse.OK("checkout session created", {
    url,
  });
  setCookieInResponse(
    response,
    getCookieHeader(
      CookieNameEnum.CHECKOUT_SESSION,
      checkoutSessionToken,
      SESSION_EXPIRY,
    ),
  );
  return response;
};

const checkout = new Hono<HonoEnv>();

checkout.use("*", authContext);
checkout.use("*", checkoutContext);

const S = CheckoutStageNameEnum;
checkout.get("/stages", checkoutRoute(null, getStages));
checkout.get(
  "/stages/personal-details",
  checkoutRoute(S.PERSONAL_DETAILS, getPersonalDetails),
);
checkout.post(
  "/stages/personal-details",
  checkoutRoute(S.PERSONAL_DETAILS, postPersonalDetails),
);
checkout.get("/stages/address", checkoutRoute(S.ADDRESS, getAddressStage));
checkout.post("/stages/address", checkoutRoute(S.ADDRESS, postAddressStage));
checkout.get("/stages/shipping", checkoutRoute(S.SHIPPING, getShipping));
checkout.post("/stages/shipping", checkoutRoute(S.SHIPPING, postShipping));
checkout.get("/stages/review", checkoutRoute(S.REVIEW, getReview));
checkout.get("/stages/payment", checkoutRoute(null, getPayment));

export default checkout;
