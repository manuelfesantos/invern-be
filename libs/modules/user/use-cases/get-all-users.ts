import type { BaseUser } from "@user-entity";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, NUMBER_ZERO } from "@number-utils";
import { selectAllUsersOperation } from "./operations/select-all-users";

export const getAllUsers = async (
  page?: string | number | null,
  pageSize?: string | number | null,
): Promise<{ count: number; users: BaseUser[] }> => {
  const pageNumber = Number(page ?? DEFAULT_PAGE);
  const pageSizeNumber = Number(pageSize ?? DEFAULT_PAGE_SIZE);
  if (isNaN(pageNumber) || pageNumber <= NUMBER_ZERO) {
    throw new Error("Invalid page number");
  }
  if (isNaN(pageSizeNumber) || pageSizeNumber <= NUMBER_ZERO) {
    throw new Error("Invalid page size");
  }
  return await selectAllUsersOperation(pageNumber, pageSizeNumber);
};
