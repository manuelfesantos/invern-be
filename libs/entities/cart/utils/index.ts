import { Cart } from "@cart-entity";

const NO_WEIGHT = 0;

export const getCartWeight = (cart: Cart): number => {
  return (
    cart.products?.reduce((totalWeight, { weight, quantity }) => {
      return totalWeight + weight * quantity;
    }, NO_WEIGHT) || NO_WEIGHT
  );
};
