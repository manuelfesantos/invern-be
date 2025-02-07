import { getCartById } from "@cart-db";
import {
  LineItem,
  Product,
  ProductIdAndQuantity,
  productIdAndQuantitySchema,
} from "@product-entity";
import { z } from "zod";
import { getProductsByProductIds } from "@product-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { toCartDTO } from "@cart-entity";
import { errors } from "@error-handling-utils";
import { Country } from "@country-entity";
import { extendCart } from "@price-utils";

const getCartPayloadSchema = z.array(productIdAndQuantitySchema);
const NO_QUANTITY = 0;

export const getCart: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId?: string,
  country?: Country,
) => {
  if (cartId) {
    const cart = await getCartById(cartId);
    if (!cart) {
      throw errors.CART_NOT_FOUND();
    }
    return protectedSuccessResponse.OK(
      tokens,
      "success getting cart",
      country ? extendCart(cart, country) : toCartDTO(cart),
      remember,
    );
  }

  const lineItems = getCartPayloadSchema.parse(body);

  const products = await getProductsByProductIds(
    getProductIdsFromLineItems(lineItems),
  );

  const cart = {
    id: "",
    products: mapProductsToLineItems(products, lineItems),
  };

  return protectedSuccessResponse.OK(
    tokens,
    "success getting cart",
    country ? extendCart(cart, country) : cart,
    remember,
  );
};

const mapProductsToLineItems = (
  products: Product[],
  lineItems: ProductIdAndQuantity[],
): LineItem[] =>
  products.reduce((acc: LineItem[], curr: Product) => {
    const lineItem = lineItems.find((item) => item.id === curr.id);
    return lineItem
      ? [...acc, { ...curr, quantity: lineItem.quantity || NO_QUANTITY }]
      : acc;
  }, []);

const getProductIdsFromLineItems = (
  lineItems: ProductIdAndQuantity[],
): string[] => lineItems.map((lineItem) => lineItem.id);
