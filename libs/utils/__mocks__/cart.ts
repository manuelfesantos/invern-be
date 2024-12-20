import { Cart, CartDTO } from "@cart-entity";
import { LineItem } from "@product-entity";

export const lineItemsMock: LineItem[] = [
  {
    images: [
      {
        alt: "1",
        url: "1",
      },
    ],
    name: "1",
    priceInCents: 1,
    id: "k8Ehw7AmHMMTzpg727ucTw",
    quantity: 1,
    stock: 1,
  },
  {
    images: [
      {
        alt: "2",
        url: "2",
      },
    ],
    name: "2",
    priceInCents: 2,
    id: "x3mExy9k6hXhLUnHDN4kns",
    quantity: 2,
    stock: 2,
  },
  {
    images: [
      {
        alt: "3",
        url: "3",
      },
    ],
    name: "3",
    priceInCents: 3,
    id: "q2kzsdpexXjH5sskRX5Y3e",
    quantity: 3,
    stock: 3,
  },
];

export const cartMock: Cart = {
  id: "",
  products: lineItemsMock,
};

export const cartDTOMock: CartDTO = {
  products: lineItemsMock,
};
