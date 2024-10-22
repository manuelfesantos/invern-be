import { ClientOrder } from "@order-entity";
import { Tax } from "@tax-entity";
import { Currency } from "@currency-entity";

const FIRST_ELEMENT = 0;

export const clientOrdersMock: ClientOrder[] = [
  {
    clientOrderId: "1",
    products: [],
    createdAt: "1",
    address: {
      addressId: "1",
      city: "1",
      country: {
        taxes: [] as Tax[],
        currencies: [] as Currency[],
        code: "PT",
        name: "1",
      },
      line1: "1",
      line2: "1",
      postalCode: "1",
    },
    payment: {
      amount: 1,
      createdAt: "1",
      state: "succeeded",
      type: "card",
    },
  },
  {
    clientOrderId: "2",
    products: [],
    createdAt: "2",
    address: {
      addressId: "2",
      city: "2",
      country: {
        taxes: [] as Tax[],
        currencies: [] as Currency[],
        code: "ES",
        name: "2",
      },
      line1: "2",
      line2: "2",
      postalCode: "2",
    },
    payment: {
      amount: 2,
      createdAt: "2",
      state: "succeeded",
      type: "card",
    },
  },
];

export const clientOrderMock = clientOrdersMock[FIRST_ELEMENT];
