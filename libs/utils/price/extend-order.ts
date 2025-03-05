import { ClientOrder, ExtendedClientOrder } from "@order-entity";
import { extendTaxes } from "./utils/extend-taxes";
import { contextStore } from "@context-utils";
import { extendLineItem } from "./utils/extend-line-item";
import { getOrderStatus } from "./utils/get-order-status";

const NO_PRICE = 0;

export const extendOrder = (order: ClientOrder): ExtendedClientOrder => {
  const { country } = contextStore.context;

  const extendedProducts = order.products.map((product) =>
    extendLineItem(product, country),
  );
  const extendedTaxes = extendTaxes(
    order.payment?.netAmount || NO_PRICE,
    country.taxes,
  );

  return {
    ...order,
    products: extendedProducts,
    taxes: extendedTaxes,
    currency: country.currency,
    status: getOrderStatus(order),
  };
};
