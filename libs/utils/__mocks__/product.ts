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
  collectionName: "collection name",
  description: "product description",
  price: 10,
  stock: 0,
  productImages: [],
};

export const productsMock: Product[] = [
  {
    productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
    productName: "product name",
    price: 10,
    stock: 0,
    productImage: imagesMock[FIRST_INDEX],
  },
  {
    productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
    productName: "product name",
    price: 10,
    stock: 0,
    productImage: imagesMock[SECOND_INDEX],
  },
  {
    productId: "c7ca3352-18c0-4468-8e2c-8f30757c1c7c",
    productName: "product name",
    price: 10,
    stock: 0,
    productImage: imagesMock[THIRD_INDEX],
  },
];
