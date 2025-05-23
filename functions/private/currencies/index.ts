import { addCurrency, getAllCurrencies } from "@currency-module";
import { successResponse } from "@response-entity";
import { requestHandler } from "@decorator-utils";
import { getBodyFromRequest } from "@http-utils";

const GET: PagesFunction = async () => {
  const currencies = await getAllCurrencies();
  return successResponse.OK("Currencies fetched successfully", currencies);
};

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const currency = await addCurrency(body);
  return successResponse.OK("Currency created successfully", currency);
};

export const onRequest = requestHandler({ GET, POST });
