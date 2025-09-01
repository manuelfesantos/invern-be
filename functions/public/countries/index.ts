import { successResponse } from "@response-entity";
import { getAllCountries } from "@country-module";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async () => {
  const countries = await getAllCountries();
  return successResponse.OK("success getting countries", countries);
});
