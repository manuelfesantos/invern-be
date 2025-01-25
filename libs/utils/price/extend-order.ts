import { ClientOrder, ExtendedClientOrder } from "@order-entity";
import { extendProduct } from "./extend-product";
import { extendTaxes } from "./utils/extend-taxes";
import { simpleAddressSchema } from "@address-entity";
import { contextStore } from "@context-utils";

const NO_PRICE = 0;

export const extendOrder = (order: ClientOrder): ExtendedClientOrder => {
  const { country } = contextStore.context;

  const extendedProducts = order.products.map((product) =>
    extendProduct(product),
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
