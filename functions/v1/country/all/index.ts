import { getAllCountries } from "@country-module";
import { generateErrorResponse } from "@response-entity";

export const onRequest = async (): Promise<Response> => {
  try {
    return await getAllCountries();
  } catch (error) {
    return generateErrorResponse(error);
  }
};
