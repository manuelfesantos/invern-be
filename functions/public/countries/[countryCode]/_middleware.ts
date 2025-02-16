import { getCountryByCountryCode } from "@country-module";
import { countryCodeSchema } from "@global-entity";
import { errorResponse } from "@response-entity";
import { getCredentials } from "@jwt-utils";
import { contextStore } from "@context-utils";
import { middlewareRequestHandler } from "@decorator-utils";
import { logCredentials } from "@logger-utils";

const SECOND_INDEX = 1;

const protectedEndpoints = ["cart", "checkout", "orders", "user"];

type ProtectedContextData = {
  endpoint?: string;
  countryCode?: string;
};

const getCountry = middlewareRequestHandler(async ({ request, next, data }) => {
  const path = request.url
    .split(`/public/countries/`)
    // eslint-disable-next-line no-unexpected-multiline
    [SECOND_INDEX].split("/");

  const [countryCode, endpoint] = path;

  data.endpoint = endpoint;
  data.countryCode = countryCode;

  return contextStore.run(next);
});

const getProtectedContext = middlewareRequestHandler<ProtectedContextData>(
  async ({ data, next, request }) => {
    const { endpoint, countryCode } = data;
    const country = await getCountryByCountryCode(
      countryCodeSchema.parse(countryCode?.toUpperCase()),
    );

    if (!country) {
      return errorResponse.BAD_REQUEST("Country is not supported");
    }

    contextStore.context.country = country;

    if (endpoint && protectedEndpoints.includes(endpoint)) {
      const { headers } = request;
      const {
        cartId,
        userId,
        accessToken,
        refreshToken,
        remember,
        address,
        userDetails,
        shippingMethod,
      } = await getCredentials(headers);

      logCredentials(cartId, userId);

      contextStore.context.cartId = cartId;
      contextStore.context.userId = userId;
      contextStore.context.accessToken = accessToken;
      contextStore.context.refreshToken = refreshToken;
      contextStore.context.remember = remember;
      contextStore.context.address = address;
      contextStore.context.userDetails = userDetails;
      contextStore.context.shippingMethodId = shippingMethod;
    }
    return next();
  },
);

export const onRequest = [getCountry, getProtectedContext];
