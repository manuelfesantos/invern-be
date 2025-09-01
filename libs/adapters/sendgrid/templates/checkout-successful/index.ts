import type { CheckoutSuccessfulTemplate } from "./types";
import type { Order } from "@order-entity";
import { ENV } from "@env-utils";
import { getPrice } from "@number-utils";

const FIRST_INDEX = 0;
const INITIAL_PRICE_VALUE = 0;
const FIRST_CHARACTER = 0;
const LAST_MINUTE_CHARACTER = 5;

export const buildCheckoutSuccessfulTemplate = (
  order: Order,
): CheckoutSuccessfulTemplate => {
  const from = `info@${ENV.SENDGRID_DOMAIN}`;
  return {
    id: "d-6166707236e94f50a06144337056bf19",
    templateData: {
      brand_logo_url: `${ENV.IMAGES_HOST}/logo.png`,
      brand_address: `Portugal`,
      brand_name: ENV.SENDGRID_NAME,
      order_id: order.id,
      order_date: formatDateFromOrderCreatedAt(order.createdAt),
      shipping_address: getShippingAddressFromOrder(order),
      customer_first_name: order.personalDetails.firstName,
      products: getProductsTemplateFromOrder(order),
      subtotal: getPrice(
        order.payment?.netAmount || getOrderPriceFromProducts(order.products),
      ),
      shipping_cost: getPrice(order.shippingMethod.rate.priceInCents),
      tax: getPrice(getTaxAmountFromOrder(order) || INITIAL_PRICE_VALUE),
      total: getPrice(
        order.payment?.grossAmount || getGrossAmountFromOrder(order),
      ),
      currency: order.country.currency.symbol,
      order_url: `${ENV.FRONTEND_HOST}/${order.country.code.toLowerCase()}/order?id=${order.id}`,
      support_email: from,
    },
    from,
    fromName: ENV.SENDGRID_NAME,
  };
};

const formatDateFromOrderCreatedAt = (date: string): string => {
  const [datePart, timePart] = date.split("T");
  return `${datePart} ${timePart.substring(FIRST_CHARACTER, LAST_MINUTE_CHARACTER)}`;
};

const getShippingAddressFromOrder = (order: Order): string => {
  const { address } = order;
  return `${address.street} ${address.houseNumber}, ${address.city}, ${address.postalCode}, ${order.country.name}`;
};

const getProductsTemplateFromOrder = (
  order: Order,
): CheckoutSuccessfulTemplate["templateData"]["products"] =>
  order.products.map((product) => ({
    image_url: product.images[FIRST_INDEX].url || "",
    name: product.name,
    quantity: product.quantity,
    price: getPrice(product.priceInCents * product.quantity),
    currency: order.country.currency.symbol,
    url: `${ENV.FRONTEND_HOST}/${order.country.code.toLowerCase()}/shop/products/${product.id}`,
  }));

const getOrderPriceFromProducts = (products: Order["products"]): number =>
  products.reduce(
    (acc, curr) => acc + curr.priceInCents * curr.quantity,
    INITIAL_PRICE_VALUE,
  );

const getTotalTaxRate = (taxes: Order["country"]["taxes"]): number =>
  taxes.reduce(
    (acc, curr) => acc + (curr.rate ?? INITIAL_PRICE_VALUE),
    INITIAL_PRICE_VALUE,
  );

const getTaxAmountFromOrder = (order: Order): number =>
  (order.payment?.netAmount || getOrderPriceFromProducts(order.products)) *
  getTotalTaxRate(order.country.taxes);

const getGrossAmountFromOrder = (order: Order): number =>
  getOrderPriceFromProducts(order.products) +
  order.shippingMethod.rate.priceInCents +
  getTaxAmountFromOrder(order);
