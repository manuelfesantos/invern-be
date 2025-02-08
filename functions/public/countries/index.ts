import { successResponse } from "@response-entity";
import { getAllCountries } from "@country-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = async () => {
  const countries = await getAllCountries();
  return successResponse.OK("success getting countries", countries);
};

export const onRequest = requestHandler({ GET });
