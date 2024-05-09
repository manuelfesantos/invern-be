import { HttpMethodEnum } from "@http-entity";

const QUERY_INDEX = 1;

export const getBodyFromRequest = async (
  request: Request,
): Promise<unknown> => {
  return request.method === HttpMethodEnum.POST ||
    request.method === HttpMethodEnum.PUT
    ? request.json()
    : undefined;
};

export const getQueryFromUrl = (url: string): URLSearchParams | null => {
  const query = url.split("?")[QUERY_INDEX];
  return query ? new URLSearchParams(query) : null;
};
