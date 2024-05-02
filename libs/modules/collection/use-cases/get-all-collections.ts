import { getCollections } from "@collection-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";

export const getAllCollections = async () => {
  try {
    const collections = await getCollections();
    return successResponse.OK(
      "success getting collections",
      collections.results,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
