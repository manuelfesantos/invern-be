import type { Cart } from "@cart-entity";
import type { Paginated } from "@pagination-entity";
import { paginationQuerySchema, toPaginatedResponse } from "@pagination-entity";
import { selectAllCartsOperation } from "./operations/select-all-carts";

export const getAllCarts = async (
  pagination?: unknown,
): Promise<Paginated<Cart>> => {
  const { page, pageSize } = paginationQuerySchema.parse(pagination ?? {});
  const { count, carts } = await selectAllCartsOperation(page, pageSize);
  return toPaginatedResponse(carts, { page, pageSize, total: count });
};
