import { ClientOrder, ExtendedClientOrder } from "@order-entity";
import { Country } from "@country-entity";
import { extendProduct } from "./extend-product";
import { extendTaxes } from "./utils/extend-taxes";
import { simpleAddressSchema } from "@address-entity";

const NO_PRICE = 0;

export const extendOrder = (
  order: ClientOrder,
  country: Country,
): ExtendedClientOrder => {
  const extendedProducts = order.products.map((product) =>
    extendProduct(product, country),
  );
  const extendedTaxes = extendTaxes(
    order.payment?.netAmount || NO_PRICE,
    country.taxes,
  );

  return {
    ...order,
    address: simpleAddressSchema.parse(order.address),
    products: extendedProducts,
    taxes: extendedTaxes,
    currency: country.currency,
  };
};
