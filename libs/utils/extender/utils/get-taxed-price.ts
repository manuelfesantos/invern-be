import { ExtendedClientTax } from "@tax-entity";

const VALUE_ZERO = 0;
export const getTaxedPrice = (taxes: ExtendedClientTax[]): number =>
  taxes.reduce((taxedPrice, { amount }) => taxedPrice + amount, VALUE_ZERO);
