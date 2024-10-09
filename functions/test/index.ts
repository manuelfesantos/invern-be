import { generateErrorResponse, successResponse } from "@response-entity";
import { Env } from "@request-entity";
import { insertData } from "./test-data";

export const onRequest: PagesFunction<Env> = async (): Promise<Response> => {
  try {
    await insertData();
    return successResponse.OK("success inserting test data");
  } catch (error) {
    return generateErrorResponse(error);
  }
};
