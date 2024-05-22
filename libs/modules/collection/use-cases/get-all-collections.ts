import { getCollections } from "@collection-db";
import { successResponse } from "@response-entity";

export const getAllCollections = async (): Promise<Response> => {
  const collections = await getCollections();
  return successResponse.OK("success getting collections", collections);
};
