import type { AdminTax } from "@tax-entity";
import { getSelectTaxByIdAction } from "@tax-db";
import { errors } from "@error-handling-utils";

export const getTaxById = async (id: string): Promise<AdminTax> => {
  const tax = await getSelectTaxByIdAction(id).run();
  if (!tax) {
    throw errors.TAX_NOT_FOUND();
  }
  return tax;
};
