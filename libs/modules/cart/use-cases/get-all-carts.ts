import { Cart } from "@cart-entity";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, NUMBER_ZERO } from "@number-utils";
import { selectAllCartsOperation } from "./operations/select-all-carts";

export const getAllCarts = async (
  page?: number | string | null,
  pageSize?: number | string | null,
): Promise<{ count: number; carts: Cart[] }> => {
  const pageNumber = Number(page ?? DEFAULT_PAGE);
  const pageSizeNumber = Number(pageSize ?? DEFAULT_PAGE_SIZE);
  if (isNaN(pageNumber) || pageNumber <= NUMBER_ZERO) {
    throw new Error("Invalid page number");
  }
  if (isNaN(pageSizeNumber) || pageSizeNumber <= NUMBER_ZERO) {
    throw new Error("Invalid page size");
  }
  return await selectAllCartsOperation(pageNumber, pageSizeNumber);
};
