import { requestHandler } from "@decorator-utils";
import { getQueryFromUrl } from "@http-utils";
import { getAllCarts } from "@cart-module";
import { successResponse } from "@response-entity";

const GET: PagesFunction = async ({ request }) => {
  const query = getQueryFromUrl(request.url);
  const page = query?.get("page");
  const pageSize = query?.get("pageSize");

  const { count, carts } = await getAllCarts(page, pageSize);
  return successResponse.OK("Carts fetched successfully", { count, carts });
};

export const onRequest = requestHandler({ GET });
