import { successResponse } from "@response-entity";
import { getAllProducts } from "@product-module";
import { getQueryFromUrl } from "@http-utils";
import { requestHandler } from "@decorator-utils";

const GET: PagesFunction = async ({ request }) => {
  const query = getQueryFromUrl(request.url);
  const search = query?.get("search") ?? null;

  const products = await getAllProducts(search, true);

  return successResponse.OK("Successfully got products", products);
};

export const onRequest = requestHandler({ GET });
