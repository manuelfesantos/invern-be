import { Product, ProductDetails } from "@product-entity";
import { imagesMock } from "./image";

const FIRST_INDEX = 0;
const SECOND_INDEX = 1;
const THIRD_INDEX = 2;

export const productIdAndQuantityMock = {
  productId: "3wXNi3kmCKABrUBJKBT91R",
  quantity: 1,
};

export const productDetailsMock: ProductDetails = {
  productId: "uEJ1rVqHRe12L39Shwywru",
  productName: "product name",
  description: "product description",
  priceInCents: 10,
  stock: 0,
  images: [],
  collectionId: "collection id",
};

export const productsMock: Product[] = [
  {
    productId: "1ioNGXZU5jYt4SSrVoSPe7",
    productName: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[FIRST_INDEX]],
  },
  {
    productId: "jJfHHxsmZyja2ikLNQkswu",
    productName: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[SECOND_INDEX]],
  },
  {
    productId: "wY35w1H8U9gTP9Nn1S9cAp",
    productName: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[THIRD_INDEX]],
  },
];
