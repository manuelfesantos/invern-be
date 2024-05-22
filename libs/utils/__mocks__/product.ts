import { Product, ProductDetails } from "@product-entity";
import { imagesMock } from "./image";

const FIRST_INDEX = 0;
const SECOND_INDEX = 1;
const THIRD_INDEX = 2;

export const productIdAndQuantityMock = {
  productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
  quantity: 1,
};

export const productDetailsMock: ProductDetails = {
  productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
  productName: "product name",
  description: "product description",
  priceInCents: 10,
  stock: 0,
  images: [],
  collectionId: "collection id",
};

export const productsMock: Product[] = [
  {
    productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
    productName: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[FIRST_INDEX]],
  },
  {
    productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
    productName: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[SECOND_INDEX]],
  },
  {
    productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
    productName: "product name",
    priceInCents: 10,
    stock: 0,
    images: [imagesMock[THIRD_INDEX]],
  },
];
