import type { Context } from "hono";

/**
 * Raw `page`/`pageSize` query params for the paginated admin list endpoints.
 * Left as strings (or undefined when absent) — the use-cases coerce, default and
 * validate them via `paginationQuerySchema`.
 */
export const paginationParams = (
  c: Context,
): { page?: string; pageSize?: string } => {
  const q = new URL(c.req.url).searchParams;
  return {
    page: q.get("page") ?? undefined,
    pageSize: q.get("pageSize") ?? undefined,
  };
};
