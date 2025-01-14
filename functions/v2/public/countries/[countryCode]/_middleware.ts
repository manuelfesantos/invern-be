import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";
import { getCountryByCode } from "@country-db";
import { countryEnumSchema } from "@country-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { getCredentials } from "@jwt-utils";

const SECOND_INDEX = 1;

const protectedEndpoints = [
  "addresses",
  "carts",
  "checkout",
  "orders",
  "users",
];

const getContext: PagesFunction<Env> = async ({ request, next, data }) => {
  const path = request.url
    .split("invernspirit.com/v2/public/countries/")
    .at(SECOND_INDEX)
    ?.split("/");

  if (!path) {
    return errorResponse.BAD_REQUEST("No endpoint provided after countries");
  }
  const [countryCode, endpoint] = path;

  try {
    if (protectedEndpoints.includes(endpoint)) {
      const { headers } = request;

      const credentials = await getCredentials(headers);

      Object.assign(data, credentials);
    }
    data.country = await getCountryByCode(
      countryEnumSchema.parse(countryCode.toUpperCase()),
    );
    return next();
  } catch (error) {
    return generateErrorResponse(error);
  }
};

export const onRequest = [getContext];
