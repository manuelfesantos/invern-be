import { successResponse } from "@response-entity";
import {
  deleteCurrency,
  getCurrencyByCode,
  updateCurrency,
} from "@currency-module";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async ({ params }) => {
  const currencyCode = params.code as string;
  const currency = await getCurrencyByCode(currencyCode);
  return successResponse.OK("Currency fetched successfully", currency);
});

export const onRequestPut = requestHandler(async ({ params, request }) => {
  const currencyCode = params.code as string;
  const body = await getBodyFromRequest(request);
  const currency = await updateCurrency(currencyCode, body);
  return successResponse.OK("Currency updated successfully", currency);
});

export const onRequestDelete = requestHandler(async ({ params }) => {
  const currencyCode = params.code as string;
  const currency = await deleteCurrency(currencyCode);
  return successResponse.OK("Currency deleted successfully", currency);
});
