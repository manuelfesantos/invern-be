import { successResponse } from "@response-entity";
import {
  deleteCurrency,
  getCurrencyByCode,
  updateCurrency,
} from "@currency-module";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

const GET: PagesFunction = async ({ params }) => {
  const currencyCode = params.code as string;
  const currency = await getCurrencyByCode(currencyCode);
  return successResponse.OK("Currency fetched successfully", currency);
};

const PUT: PagesFunction = async ({ params, request }) => {
  const currencyCode = params.code as string;
  const body = await getBodyFromRequest(request);
  const currency = await updateCurrency(currencyCode, body);
  return successResponse.OK("Currency updated successfully", currency);
};

const DELETE: PagesFunction = async ({ params }) => {
  const currencyCode = params.code as string;
  const currency = await deleteCurrency(currencyCode);
  return successResponse.OK("Currency deleted successfully", currency);
};

export const onRequest = requestHandler({ GET, PUT, DELETE });
