import { successResponse } from "@response-entity";
import { getCollectionDetails } from "@collection-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = async ({ params }): Promise<Response> => {
  const { id } = params;

  const collection = await getCollectionDetails(id as string);
  return successResponse.OK("success getting collection details", collection);
};

export const onRequest = requestHandler({ GET });
