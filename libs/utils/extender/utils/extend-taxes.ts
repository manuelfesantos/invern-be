import { ExtendedClientTax, Tax } from "@tax-entity";
import { calculateTaxAmount } from "./calculate-tax-amount";

export const extendTaxes = (price: number, taxes: Tax[]): ExtendedClientTax[] =>
  taxes.map((tax) => ({
    name: tax.name,
    rate: tax.rate,
    amount: calculateTaxAmount(price, tax),
  }));
