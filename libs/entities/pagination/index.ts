import * as z from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
/** Hard cap so a caller can't request an abusive page size (full-table scan). */
export const MAX_PAGE_SIZE = 100;

/**
 * The admin list query contract. Coerces string query params, applies defaults,
 * and bounds both values. Invalid input surfaces as a ZodError → 400 (never a
 * generic 500).
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** The shared paginated-response envelope every admin list endpoint returns. */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export const toPaginatedResponse = <T>(
  data: T[],
  { page, pageSize, total }: Omit<Paginated<T>, "data">,
): Paginated<T> => ({ data, page, pageSize, total });
