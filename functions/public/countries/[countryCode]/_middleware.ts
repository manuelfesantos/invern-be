import { getCountryByCountryCode } from "@country-module";
import { countryCodeSchema } from "@global-entity";
import { errorResponse } from "@response-entity";
import { getCredentials } from "@jwt-utils";
import { contextStore } from "@context-utils";
import { middlewareRequestHandler } from "@decorator-utils";
import { logCredentials } from "@logger-utils";
import { countryCache } from "@cache-utils";
import { Country } from "@country-entity";

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
    const { endpoint, countryCode: maybeCountryCode } = data;

    const countryCode = countryCodeSchema.parse(
      maybeCountryCode?.toUpperCase(),
    );

    let country: Country;

    const cachedCountry = countryCache.get(countryCode);

    if (cachedCountry) {
      country = cachedCountry;
    } else {
      const maybeCountry = await getCountryByCountryCode(countryCode);
      if (!maybeCountry) {
        return errorResponse.BAD_REQUEST("Country is not supported");
      }
      country = maybeCountry;
      countryCache.add(country);
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
        customerEmail,
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
      contextStore.context.customerEmail = customerEmail;
    }
    return next();
  },
);

export const onRequest = [getCountry, getProtectedContext];
