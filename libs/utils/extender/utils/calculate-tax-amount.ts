import { Tax } from "@tax-entity";

const VALUE_ZERO = 0;

export const calculateTaxAmount = (priceInCents: number, tax: Tax): number =>
  priceInCents * (tax.rate || VALUE_ZERO);
