import { successResponse } from "@response-entity";
import {
  deleteCollection,
  getCollectionDetails,
  updateCollection,
} from "@collection-module";
import { requestHandler } from "@decorator-utils";

import { getBodyFromRequest } from "@http-utils";

export const onRequestGet = requestHandler(
  async ({ params }): Promise<Response> => {
    const { id } = params;

    const collection = await getCollectionDetails(id as string, true);
    return successResponse.OK("success getting collection details", collection);
  },
);

export const onRequestPut = requestHandler(
  async ({ request, params }): Promise<Response> => {
    const { id } = params;
    const body = await getBodyFromRequest(request);

    const collection = await updateCollection(id as string, body);

    return successResponse.OK("success updating collection", collection);
  },
);

export const onRequestDelete = requestHandler(
  async ({ params }): Promise<Response> => {
    const { id } = params;

    await deleteCollection(id as string);

    return successResponse.OK("success deleting collection");
  },
);
