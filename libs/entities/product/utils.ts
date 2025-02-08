import { LineItem } from "./product-entity";

export const toTotalWeight = (
  totalWeight: number,
  { weight, quantity }: LineItem,
): number => {
  return totalWeight + weight * quantity;
};
