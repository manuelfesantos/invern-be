import { Product, ProductDetails } from "@product-entity";
import { imagesMock } from "./image";

const FIRST_INDEX = 0;
const SECOND_INDEX = 1;
const THIRD_INDEX = 2;

export const productIdAndQuantityMock = {
  id: "3wXNi3kmCKABrUBJKBT91R",
  quantity: 1,
};

export const productDetailsMock: ProductDetails = {
  id: "uEJ1rVqHRe12L39Shwywru",
  name: "product name",
  description: "product description",
  priceInCents: 10,
  stock: 0,
  images: [],
  collectionId: "collection id",
};

export const productsMock: Product[] = [
  {
    id: "1ioNGXZU5jYt4SSrVoSPe7",
    name: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[FIRST_INDEX]],
  },
  {
    id: "jJfHHxsmZyja2ikLNQkswu",
    name: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[SECOND_INDEX]],
  },
  {
    id: "wY35w1H8U9gTP9Nn1S9cAp",
    name: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[THIRD_INDEX]],
  },
];
