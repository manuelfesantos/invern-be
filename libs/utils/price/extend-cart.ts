import { Cart, ExtendedCart, extendedCartSchema } from "@cart-entity";
import { Country } from "@country-entity";
import { extendTaxes } from "./utils/extend-taxes";
import { getTaxedPrice } from "./utils/get-taxed-price";
import { ExtendedLineItem } from "@product-entity";
import { extendLineItem } from "./utils/extend-line-item";

const VALUE_ZERO = 0;

export const extendCart = (cart: Cart, country: Country): ExtendedCart => {
  const extendedProducts = (cart.products || []).map((product) =>
    extendLineItem(product, country),
  );

  const netPrice = getCartNetPrice(extendedProducts);

  const extendedTaxes = extendTaxes(netPrice, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  return extendedCartSchema.parse({
    ...cart,
    products: extendedProducts,
    taxes: extendedTaxes,
    netPrice,
    grossPrice: netPrice + taxedPrice,
    currency: country.currency,
  });
};

const getCartNetPrice = (products: ExtendedLineItem[]): number =>
  products.reduce(
    (totalPrice, { netPrice, quantity }) => totalPrice + netPrice * quantity,
    VALUE_ZERO,
  );
