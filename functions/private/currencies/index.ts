import { addCurrency, getAllCurrencies } from "@currency-module";
import { successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { getBodyFromRequest } from "@http-utils";

export const onRequestGet = requestHandler(async () => {
  const currencies = await getAllCurrencies();
  return successResponse.OK("Currencies fetched successfully", currencies);
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const currency = await addCurrency(body);
  return successResponse.OK("Currency created successfully", currency);
});
