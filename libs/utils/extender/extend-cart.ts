import { CartDTO, ExtendedCart, extendedCartSchema } from "@cart-entity";
import { extendTaxes } from "./utils/extend-taxes";
import { getTaxedPrice } from "./utils/get-taxed-price";
import { ExtendedLineItem } from "@product-entity";
import { extendLineItem } from "./utils/extend-line-item";
import { contextStore } from "@context-utils";

const VALUE_ZERO = 0;

export const extendCart = (cart: CartDTO): ExtendedCart => {
  const issues: string[] = [];
  const { country } = contextStore.context;
  const extendedProducts = (cart.products || []).map((product) =>
    extendLineItem(product, country),
  );

  const productsHaveIssues = extendedProducts.some(({ issues }) =>
    Boolean(issues),
  );

  const isCheckoutPossible =
    !productsHaveIssues && extendedProducts.length > VALUE_ZERO;

  if (productsHaveIssues) {
    issues.push("Some products have issues");
  }

  const netPrice = getCartNetPrice(extendedProducts);

  const extendedTaxes = extendTaxes(netPrice, country.taxes);

  const taxedPrice = getTaxedPrice(extendedTaxes);

  const extendedCart: ExtendedCart = {
    ...cart,
    products: extendedProducts,
    taxes: extendedTaxes,
    netPrice,
    grossPrice: netPrice + taxedPrice,
    isCheckoutPossible,
    ...(issues.length && { issues }),
  };
  return extendedCartSchema.parse(extendedCart);
};

const getCartNetPrice = (products: ExtendedLineItem[]): number =>
  products.reduce(
    (totalPrice, { netPrice, quantity }) => totalPrice + netPrice * quantity,
    VALUE_ZERO,
  );
